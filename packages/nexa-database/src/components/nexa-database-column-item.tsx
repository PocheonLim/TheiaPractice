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

export interface NexaDatabaseColumnItemProps {
    column: ColumnData;
    onUpdate: (column: ColumnData) => void;
    onDelete: () => void;
}

export const NexaDataBaseColumnItem: React.FC<NexaDatabaseColumnItemProps> = ({ column, onUpdate, onDelete }) => {
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, name: e.target.value });
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({ ...column, preset: e.target.value as ColumnData['preset'] });
    };

    const handlePrimaryKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, primaryKey: e.target.checked });
    };

    const handleNotNullChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, notNull: e.target.checked });
    };

    const handleUniqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, unique: e.target.checked });
    };

    return (
        <div className="column-item-container">
            <div className="column-item-left">
                <span className="drag-handle">▶</span>
                <label>
                    <input
                        type="checkbox"
                        checked={column.primaryKey}
                        onChange={handlePrimaryKeyChange}
                    />
                    PK
                </label>
                <input
                    type="text"
                    value={column.name}
                    onChange={handleNameChange}
                    placeholder="column_name"
                />
                <select value={column.preset || 'custom'} onChange={handlePresetChange}>
                    <option value="uuid">UUID</option>
                    <option value="auto_increment_id">Auto Increment ID</option>
                    <option value="created_time">Created Time</option>
                    <option value="text">Text</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="number">Number</option>
                    <option value="json">JSON</option>
                    <option value="date">Date</option>
                    <option value="datetime">DateTime</option>
                    <option value="foreign_key">Foreign Key</option>
                    <option value="custom">Custom</option>
                </select>
                <input
                    type="checkbox"
                    checked={column.notNull}
                    onChange={handleNotNullChange}
                />
                <input
                    type="checkbox"
                    checked={column.unique}
                    onChange={handleUniqueChange}
                />
            </div>
            <div className="column-item-actions">
                <button onClick={onDelete}>Delete</button>
            </div>
        </div>
    );
};
