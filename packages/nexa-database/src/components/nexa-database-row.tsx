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

export interface NexaDatabaseDataProps {
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

export const NexaDatabaseRow: React.FC<NexaDatabaseDataProps> = ({
    tableName, columns, rows, onAddRow, onDeleteRow, onEditRow, onSaveRow, onCancelRow, onRefresh, onImportData
}) => {
    const [text, setText] = React.useState('');
    const [columnName, setColumnName] = React.useState('ALL');

    // 1단계: 단일 row가 검색 조건에 맞는지 확인
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
        if (!columnValue) {
            return false;
        }
        return columnValue.toLowerCase().includes(searchText);
    };

    // 2단계: 모든 rows를 필터링하는 함수
    const filterRows = (): Array<{ row: RowData; originalIndex: number }> => {
        const result: Array<{ row: RowData; originalIndex: number }> = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // 검색어가 없으면 모든 row 포함
            if (!text.trim()) {
                result.push({ row, originalIndex: i });
                continue;
            }

            // 검색어가 있으면 필터링
            const searchText = text.toLowerCase();
            if (isRowMatchingSearch(row, searchText, columnName)) {
                result.push({ row, originalIndex: i });
            }
        }

        return result;
    };

    // 3단계: 필터링된 결과를 메모이제이션
    const filteredRowsWithIndex = React.useMemo(() => filterRows(), [rows, text, columnName]);

    const refreshFilter = (): void => {
        setText('');
        setColumnName('ALL');
        onRefresh();
    };

    const handleImportData = async (): Promise<void> => {
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

            // 테이블의 각 컬럼에 대해
            for (const tableColumn of columns) {
                // 매핑에서 해당 테이블 컬럼과 매칭된 CSV 컬럼 찾기
                let csvColumnName: string | undefined;
                for (const [csvCol, tableCol] of result.mapping.entries()) {
                    if (tableCol === tableColumn.name) {
                        csvColumnName = csvCol;
                        break;
                    }
                }

                // 매칭된 CSV 컬럼이 있으면 값 복사, 없으면 빈 문자열
                if (csvColumnName) {
                    rowValues[tableColumn.name] = csvRow[csvColumnName];
                } else {
                    rowValues[tableColumn.name] = '';
                }
            }

            return {
                values: rowValues,
                isEditing: false
            };
        });

        onImportData(importedRows, result.importMode as 'append' | 'replace' | 'upsert');
    };

    return (
        <div className='nexa-database-data'>
            <div className='nexa-database-data-title'>
                <div className='nexa-database-data-title-left'>
                    Table Data
                </div>
                <div className='nexa-database-data-title-right'>
                    <span>{rows.length} rows</span>
                    <button onClick={handleImportData}>Import Data</button>
                    <button onClick={onAddRow}>+Add Row</button>
                    <button onClick={refreshFilter}>Refresh</button>
                </div>
            </div>
            <div className='nexa-database-data-search-container'>
                <div className='nexa-database-data-search'>
                    <input
                        type='text'
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder='Search across all columns...'
                    />
                </div>
                <div className='nexa-database-data-select-column'>
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
            <div className='nexa-database-data-grid'>
                <div className='nexa-database-data-grid-title'>
                    {columns.map((column, index) => (
                        <div key={index} className='nexa-database-data-grid-column'>{column.name}</div>
                    ))}
                    <div>Action</div>
                </div>
                {filteredRowsWithIndex.map(({ row, originalIndex }) => (
                    <NexaDatabaseRowItem
                        key={originalIndex}
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

