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
import { ColumnData, Mode, EditingColumns } from '../common/nexa-database-types';
import { NexaDataBaseColumnItem } from './nexa-database-column-item';

export interface NexaDatabaseColumnProps {
    tableName: string;
    mode: Mode;
    columns: ColumnData[];
    editingColumns: EditingColumns;
    onAddColumn: () => void;
    onUpdateColumn: (index: number, column: ColumnData) => void;
    onDeleteColumn: (index: number) => void;
    onEditColumn?: (index: number) => void;
    onSaveColumn?: (index: number, column: ColumnData) => void;
    onCancelColumn?: (index: number) => void;
    onUpdateEditingColumn: (index: number, column: ColumnData) => void;
}

export const NexaDatabaseColumn: React.FC<NexaDatabaseColumnProps> = ({
    tableName,
    mode,
    columns,
    editingColumns = {},
    onAddColumn,
    onUpdateColumn,
    onDeleteColumn,
    onEditColumn,
    onSaveColumn,
    onCancelColumn,
    onUpdateEditingColumn
}: NexaDatabaseColumnProps) => (
    <div className='nexa-database-column'>
        <div className='nexa-database-column-title'>
            <div className='nexa-database-column-title-left'>
                Table Column
            </div>
            <button onClick={onAddColumn}>+Add Column</button>
        </div>
        <div className='nexa-database-column-grid'>
            <div className='nexa-database-column-grid-title'>
                <div className='nexa-database-column-grid-title-left'>
                    <span></span>
                    <span>PK</span>
                    <span>COLUMN NAME</span>
                    <span>PRESET</span>
                    <span>NULLABLE</span>
                    <span>UNIQUE</span>
                    <span>TYPE DEFINITION</span>
                </div>
                <div className='nexa-database-column-grid-title-right'>
                    <span>ACTIONS</span>
                </div>
            </div>
            {columns.map((column, index) => (
                <NexaDataBaseColumnItem
                    tableName={tableName}
                    key={index}
                    mode={mode}
                    column={column}
                    editingColumn={editingColumns[index]}
                    onUpdate={updatedColumn => onUpdateColumn(index, updatedColumn)}
                    onDelete={() => onDeleteColumn(index)}
                    onEdit={() => onEditColumn?.(index)}
                    onSave={updatedColumn => onSaveColumn?.(index, updatedColumn)}
                    onCancel={() => onCancelColumn?.(index)}
                    onUpdateEditingColumn={updatedColumn => onUpdateEditingColumn(index, updatedColumn)}
                />
            ))}
        </div>
    </div>
);
