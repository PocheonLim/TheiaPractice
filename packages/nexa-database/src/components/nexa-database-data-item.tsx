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
import { RowData } from '../common/nexa-database-types';

export interface NexaDatabaseDataItemProps {
    rowData: RowData;
    onDelete: () => void;
}

export const NexaDatabaseDataItem: React.FC<NexaDatabaseDataItemProps> = ({ rowData, onDelete }) => {
    const valueEntries = Object.entries(rowData.values);
    console.log('rowData.values:', rowData.values);
    console.log('valueEntries:', valueEntries);
    console.log('valueEntries.length:', valueEntries.length);

    return (
        <div className='nexa-database-data-item'>
            {valueEntries.map(([columnName, value]) => (
                <div key={columnName} className='nexa-database-data-item-cell'>
                    <input type='text' placeholder={value} />
                </div>
            ))}
            <div className='nexa-database-data-item-action'>
                <button onClick={onDelete}>Delete</button>
            </div>
        </div>
    );
};
