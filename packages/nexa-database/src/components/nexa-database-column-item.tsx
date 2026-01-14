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
import { ColumnData, Mode } from '../common/nexa-database-types';
import { NexaDatabaseColumnDetail } from './nexa-database-column-detail';
import { PRESET_INFO } from '../common/nexa-database-presets';

export interface NexaDatabaseColumnItemProps {
    column: ColumnData;
    mode: Mode;
    onUpdate: (column: ColumnData) => void;
    onDelete: () => void;
    onEdit?: () => void;
    onSave?: (column: ColumnData) => void;
    onCancel?: () => void;
}

export const NexaDataBaseColumnItem: React.FC<NexaDatabaseColumnItemProps> = ({
    column,
    mode,
    onUpdate,
    onDelete,
    onEdit,
    onSave,
    onCancel
}: NexaDatabaseColumnItemProps) => {
    const [editedColumn, setEditedColumn] = React.useState<ColumnData>(column);
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);

    React.useEffect(() => {
        setEditedColumn(column);
    }, [column]);

    React.useEffect(() => {
        setIsDetailOpen(false);
    }, [mode]);

    const isEditing = column.isEditing || false;
    const isEditMode = mode === 'EDIT';
    const isReadOnly = isEditMode && !isEditing;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditMode) {
            setEditedColumn({ ...editedColumn, name: e.target.value });
        } else {
            onUpdate({ ...column, name: e.target.value });
        }
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (isEditMode) {
            setEditedColumn({ ...editedColumn, preset: e.target.value as ColumnData['preset'] });
        } else {
            onUpdate({ ...column, preset: e.target.value as ColumnData['preset'] });
        }
    };

    const handlePrimaryKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditMode) {
            setEditedColumn({ ...editedColumn, primaryKey: e.target.checked });
        } else {
            onUpdate({ ...column, primaryKey: e.target.checked });
        }
    };

    const handleNotNullChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditMode) {
            setEditedColumn({ ...editedColumn, nullable: e.target.checked });
        } else {
            onUpdate({ ...column, nullable: e.target.checked });
        }
    };

    const handleUniqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditMode) {
            setEditedColumn({ ...editedColumn, unique: e.target.checked });
        } else {
            onUpdate({ ...column, unique: e.target.checked });
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(editedColumn);
            setIsDetailOpen(false);
        }
    };

    const handleCancel = () => {
        setEditedColumn(column);
        setIsDetailOpen(false);
        if (onCancel) {
            onCancel();
        }
    };

    const handleEdit = () => {
        setIsDetailOpen(true);
        if (onEdit) {
            onEdit();
        }
    };

    const toggleDetail = () => {
        if (!isReadOnly) {
            setIsDetailOpen(!isDetailOpen);
        }
    };

    return (
        <>
            <div className="column-item-container">
                <div className="column-item-left">
                    <span
                        className="drag-handle"
                        onClick={toggleDetail}
                        style={{
                            transform: isDetailOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            cursor: isReadOnly ? '' : 'pointer',
                        }}
                    >
                        ▶
                    </span>
                    <label>
                        <input
                            type="checkbox"
                            checked={isEditMode ? editedColumn.primaryKey : column.primaryKey}
                            onChange={handlePrimaryKeyChange}
                            disabled={isReadOnly}
                        />
                    </label>
                    <input
                        type="text"
                        value={isEditMode ? editedColumn.name : column.name}
                        onChange={handleNameChange}
                        placeholder="column_name"
                        disabled={isReadOnly}
                    />
                    <select
                        value={(isEditMode ? editedColumn.preset : column.preset) || 'custom'}
                        onChange={handlePresetChange}
                        disabled={isReadOnly}
                    >
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
                    <label>
                        <input
                            type="checkbox"
                            checked={isEditMode ? editedColumn.nullable : column.nullable}
                            onChange={handleNotNullChange}
                            disabled={isReadOnly}
                        />
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={isEditMode ? editedColumn.unique : column.unique}
                            onChange={handleUniqueChange}
                            disabled={isReadOnly}
                        />
                    </label>
                    <span className="column-type-display">
                        {column.preset && PRESET_INFO[column.preset]
                            ? PRESET_INFO[column.preset].defaultType
                            : (isEditMode ? editedColumn.type : column.type) || 'CHAR'}
                    </span>
                </div>
                <div className="column-item-actions">
                    {isEditMode ? (
                        isEditing ? (
                            <>
                                <button onClick={handleSave}>Save</button>
                                <button onClick={handleCancel}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleEdit}>Edit</button>
                                <button onClick={onDelete}>Delete</button>
                            </>
                        )
                    ) : (
                        <button onClick={onDelete}>Delete</button>
                    )}
                </div>
            </div>
            {isDetailOpen && (
                <NexaDatabaseColumnDetail
                    column={isEditMode ? editedColumn : column}
                    onUpdate={isEditMode ? setEditedColumn : onUpdate}
                    disabled={isReadOnly}
                />
            )}
        </>
    );
};
