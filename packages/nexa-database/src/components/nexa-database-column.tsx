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
import { ColumnData } from '../common/types';
import { NexaDataBaseColumnItem } from './nexa-database-column-item';

export const NexaDatabaseColumn: React.FC = () => {
    const [columns, setColumns] = React.useState<ColumnData[]>([]);
    const [nextId, setNextId] = React.useState(1);

    const handleAddColumn = () => {
        const newColumn: ColumnData = {
            id: nextId
        };
        setColumns([...columns, newColumn]);
        setNextId(nextId + 1);
    };

    return (
        <div className='nexa-database-column'>
            <div className='nexa-database-column-title'>
                <>
                    Table Column
                </>
                <button onClick={handleAddColumn}>+Add Column</button>
            </div>
            <div className='nexa-database-column-grid'>
                <div className='nexa-database-column-grid-title'>
                    <div className='nexa-database-column-grid-title-left'>
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
                <div className='nexa-database-column-grid-content'>
                    {columns.map(column => (
                        <NexaDataBaseColumnItem key={column.id} column={column} />
                    ))}
                </div>
            </div>
        </div>
    );
};

