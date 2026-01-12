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
import { NexaDatabaseDataItem } from './nexa-database-data-item';

export interface NexaDatabaseDataProps {
    columns: ColumnData[];
    rows: RowData[];
    onAddRow: () => void;
    onDeleteRow: (index: number) => void;
    onEditRow: (index: number) => void;
    onSaveRow: (index: number, newValues: Record<string, string>) => void;
    onCancelRow: (index: number) => void;
    onRefresh: () => void;
}

export const NexaDatabaseData: React.FC<NexaDatabaseDataProps> = ({ columns, rows, onAddRow, onDeleteRow, onEditRow, onSaveRow, onCancelRow, onRefresh }) => {
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

    return (
        <div className='nexa-database-data'>
            <div className='nexa-database-data-title'>
                <div className='nexa-database-data-title-left'>
                    Table Data
                </div>
                <div className='nexa-database-data-title-right'>
                    <span>{rows.length} rows</span>
                    <button>Import Data</button>
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
                    <NexaDatabaseDataItem
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

