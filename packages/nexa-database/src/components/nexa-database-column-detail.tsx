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
import { ColumnData } from '../common/nexa-database-types';
import { PRESET_INFO } from '../common/nexa-database-presets';

export interface NexaDatabaseColumnDetailProps {
    column: ColumnData;
    onUpdate: (column: ColumnData) => void;
    disabled?: boolean;
}

export const NexaDatabaseColumnDetail: React.FC<NexaDatabaseColumnDetailProps> = ({
    column,
    onUpdate,
    disabled = false
}) => {
    const presetInfo = column.preset ? PRESET_INFO[column.preset] : undefined;

    const handlePrimaryKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, primaryKey: e.target.checked });
    };

    const handleNullableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, nullable: e.target.checked });
    };

    const handleUniqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, unique: e.target.checked });
    };

    return (
        <div className="column-detail-container">
            {presetInfo && (
                <div className='column-detail-preset-container'>
                    <div className='column-detail-preset-name'>
                        <span className='column-detail-preset-icon'>{presetInfo.icon}</span>
                        <span className='column-detail-preset-title'>{presetInfo.name}</span>
                    </div>
                    <div className='column-detail-preset-description'>
                        {presetInfo.description}
                    </div>
                </div>
            )}
            <div className='column-detail-button-container'>
                <div className='column-detail-button'>
                    <input
                        type="checkbox"
                        checked={column.primaryKey || false}
                        onChange={handlePrimaryKeyChange}
                        disabled={disabled}
                    />
                    PK
                </div>
                <div className='column-detail-button'>
                    <input
                        type="checkbox"
                        checked={column.nullable || false}
                        onChange={handleNullableChange}
                        disabled={disabled}
                    />
                    Nullable
                </div>
                <div className='column-detail-button'>
                    <input
                        type="checkbox"
                        checked={column.unique || false}
                        onChange={handleUniqueChange}
                        disabled={disabled}
                    />
                    Unique
                </div>
            </div>
            <div className='column-detail-comment'>
                COMMENT
                <textarea placeholder='Add column description or notes...' />
            </div>
        </div>
    );
};
