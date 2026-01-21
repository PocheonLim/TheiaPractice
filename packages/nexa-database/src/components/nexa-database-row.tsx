// *****************************************************************************
// Copyright (C) 2018 Ericsson and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import * as React from '@theia/core/shared/react';
import { ColumnData, RowData } from '../common/nexa-database-types';
import { NexaDatabaseRowItem } from './nexa-database-row-item';
import { NexaDatabaseRowDialog } from './nexa-database-row-dialog';
import { ConfirmDialog } from '@theia/core/lib/browser/dialogs';

export interface NexaDatabaseRowProps {
    tableName: string;
    columns: ColumnData[];
    rows: RowData[];
    onAddRow: () => void;
    onDeleteRow: (index: number) => void;
    onEditRow: (index: number) => void;
    onSaveRow: (index: number, newValues: Record<string, string>) => void;
    onCancelRow: (index: number) => void;
    onRefresh: () => void;
    onImportData: (rows: RowData[], mode: 'append' | 'replace' | 'upsert') => void;
}

export const NexaDatabaseRow: React.FC<NexaDatabaseRowProps> = ({
    tableName, columns, rows, onAddRow, onDeleteRow, onEditRow, onSaveRow, onCancelRow, onRefresh, onImportData
}) => {
    const [text, setText] = React.useState('');
    const [columnName, setColumnName] = React.useState('ALL');

    // 단일 row가 검색 조건에 맞는지 확인
    const isRowMatchingSearch = (row: RowData, searchText: string, targetColumn: string): boolean => {
        // 모든 컬럼에서 검색
        if (targetColumn === 'ALL') {
            const allValues = Object.values(row.values);
            for (const value of allValues) {
                if (value.toLowerCase().includes(searchText)) {
                    return true;
                }
            }
            return false;
        }

        // 특정 컬럼에서만 검색
        const columnValue = row.values[targetColumn];
        return columnValue.toLowerCase().includes(searchText);
    };

    // 모든 rows를 필터링하는 함수
    const filterRows = (): Array<{ row: RowData; originalIndex: number }> => {
        const result: Array<{ row: RowData; originalIndex: number }> = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const searchText = text.toLowerCase();
            if (isRowMatchingSearch(row, searchText, columnName)) {
                result.push({ row, originalIndex: i });
            }
        }

        return result;
    };

    const filteredRowsWithIndex = filterRows();

    const refreshFilter = (): void => {
        setText('');
        setColumnName('ALL');
        onRefresh();
    };

    const handleImportData = async (): Promise<void> => {
        if (!tableName) {
            const tableConfirm = new ConfirmDialog({
                title: '테이블명 필요',
                msg: '테이블명을 먼저 입력해주세요.',
                ok: '확인'
            });
            tableConfirm.open();
            return;
        }
        if (columns.length === 0) {
            const columnConfirm = new ConfirmDialog({
                title: '컬럼 필요',
                msg: '컬럼을 생성해주세요',
                ok: '확인'
            });
            columnConfirm.open();
            return;
        }
        const dialog = new NexaDatabaseRowDialog({
            tableName,
            currentColumns: columns,
            currentRows: rows
        });
        const result = await dialog.open();

        if (!result) {
            return;
        }

        // CSV 데이터를 테이블 컬럼 순서에 맞게 변환
        const importedRows: RowData[] = result.rows.map(csvRow => {
            const rowValues: Record<string, string> = {};

            // 테이블의 각 컬럼에 대해 매핑된 CSV 컬럼의 값을 복사
            for (const tableColumn of columns) {
                // 테이블 컬럼이 매핑에 있으면 해당 테이블 컬럼 값에는 csv row 값 넣고 아닐 경우 공백
                const mappingColumn = Array.from(result.mapping);
                const csvColumnName = mappingColumn.find(([_, tableCol]) => tableCol === tableColumn.name)?.[0];

                rowValues[tableColumn.name] = csvColumnName ? csvRow.values[csvColumnName] : '';
            }

            return {
                values: rowValues,
                isEditing: false
            };
        });

        onImportData(importedRows, result.importMode as 'append' | 'replace' | 'upsert');
    };

    return (
        <div className='nexa-database-row'>
            <div className='nexa-database-row-title'>
                <div className='nexa-database-row-title-left'>
                    Table Data
                </div>
                <div className='nexa-database-row-title-right'>
                    <span>{rows.length} rows</span>
                    <button onClick={handleImportData}>📥 Import Data</button>
                    <button onClick={onAddRow}>+Add Row</button>
                    <button onClick={refreshFilter}>🔄 Refresh</button>
                </div>
            </div>
            <div className='nexa-database-row-search-container'>
                <div className='nexa-database-row-search'>
                    <input
                        type='text'
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder='Search across all columns...'
                    />
                </div>
                <div className='nexa-database-row-select-column'>
                    <select value={columnName} onChange={e => setColumnName(e.target.value)}>
                        <option value='ALL'>All Column</option>
                        {columns.map((column, index) => (
                            <option key={column.name} value={column.name}>
                                {column.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='nexa-database-row-grid'>
                <div className='nexa-database-row-grid-title'>
                    {columns.map((column, index) => (
                        <div key={index} className='nexa-database-row-grid-column'>{column.name}</div>
                    ))}
                    <div>Action</div>
                </div>
                {filteredRowsWithIndex.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-text">No data found</div>
                        <div className="empty-state-subtext">Add a new row to get started</div>
                    </div>
                )}
                {filteredRowsWithIndex.map(({ row, originalIndex }) => (
                    <NexaDatabaseRowItem
                        key={originalIndex}
                        columns={columns}
                        rowData={row}
                        onEdit={() => onEditRow(originalIndex)}
                        onSave={newValues => onSaveRow(originalIndex, newValues)}
                        onCancel={() => onCancelRow(originalIndex)}
                        onDelete={() => onDeleteRow(originalIndex)}
                    />
                ))}
            </div>
        </div>
    );
};
