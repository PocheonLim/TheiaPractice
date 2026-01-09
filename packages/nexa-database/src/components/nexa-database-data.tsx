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
}

export const NexaDatabaseData: React.FC<NexaDatabaseDataProps> = ({ columns, rows, onAddRow, onDeleteRow }) => (
    <div className='nexa-database-data'>
        <div className='nexa-database-data-title'>
            <div className='nexa-database-data-title-left'>
                Table Data
            </div>
            <div className='nexa-database-data-title-right'>
                <span>{rows.length} rows</span>
                <button>Import Data</button>
                <button onClick={onAddRow}>+Add Row</button>
                <button>Refresh</button>
            </div>
        </div>
        <div className='nexa-database-data-search-container'>
            <div className='nexa-database-data-search'>
                <input
                    type='text'
                    placeholder='Search across all columns...'
                />
            </div>
            <div className='nexa-database-data-select-column'>
                <select>
                    {columns.map((column, index) => (
                        <option>{column.name}</option>
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
            {rows.map((row, index) => (
                <NexaDatabaseDataItem
                    rowData={row}
                    onDelete={() => onDeleteRow(index)}
                />
            ))}
        </div>
    </div>
);
