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
import { ConfirmDialog } from '@theia/core/lib/browser/dialogs';
import { ColumnData, Mode } from '../common/nexa-database-types';
import { NexaDatabaseColumnDetail } from './nexa-database-column-detail';
import { PRESET_INFO } from '../common/nexa-database-presets';

function getTypeDefinition(col: ColumnData): string {
    let def = col.type || 'VARCHAR';

    if (col.length && ['VARCHAR', 'CHAR', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT'].includes(col.type || '')) {
        def += `(${col.length})`;
    } else if (col.type === 'DECIMAL' && col.decimalPlaces) {
        const precision = col.precision || String(10 + parseInt(col.decimalPlaces, 10));
        def += `(${precision},${col.decimalPlaces})`;
    }

    if (col.unsigned) {
        def += ' UNSIGNED';
    }
    return def;
}

export interface NexaDatabaseColumnItemProps {
    tableName: string;
    column: ColumnData;
    mode: Mode;
    editingColumn?: ColumnData;
    onUpdate: (column: ColumnData) => void;
    onDelete: () => void;
    onEdit: () => void;
    onSave: (column: ColumnData) => void;
    onCancel?: () => void;
    onUpdateEditingColumn: (column: ColumnData) => void;
}

export const NexaDataBaseColumnItem: React.FC<NexaDatabaseColumnItemProps> = ({
    tableName,
    column,
    mode,
    editingColumn,
    onUpdate,
    onDelete,
    onEdit,
    onSave,
    onCancel,
    onUpdateEditingColumn
}: NexaDatabaseColumnItemProps) => {
    // editingColumn이 있으면 사용, 없으면 column 사용
    const editedColumn = editingColumn || column;

    const isEditing = column.isEditing || false;
    const isDetailOpen = column.isDetailOpen || false;
    const isEditMode = mode === 'EDIT';
    const isReadOnly = isEditMode && !isEditing;

    // 편집 중인 컬럼 업데이트
    const updateEditingColumn = (updatedColumn: ColumnData) => {
        if (mode === 'EDIT') {
            onUpdateEditingColumn(updatedColumn);
        } else {
            onUpdate(updatedColumn);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditMode) {
            updateEditingColumn({ ...editedColumn, name: e.target.value });
        } else {
            onUpdate({ ...column, name: e.target.value });
        }
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (isEditMode) {
            updateEditingColumn({ ...editedColumn, preset: e.target.value as ColumnData['preset'] });
        } else {
            onUpdate({ ...column, preset: e.target.value as ColumnData['preset'] });
        }
    };

    const handlePrimaryKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isPK = e.target.checked;
        if (isEditMode) {
            // PK인 경우 nullable은 자동으로 false
            updateEditingColumn({ ...editedColumn, primaryKey: isPK, nullable: isPK ? false : editedColumn.nullable });
        } else {
            onUpdate({ ...column, primaryKey: isPK, nullable: isPK ? false : column.nullable });
        }
    };

    const handleNotNullChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditMode) {
            updateEditingColumn({ ...editedColumn, nullable: e.target.checked });
        } else {
            onUpdate({ ...column, nullable: e.target.checked });
        }
    };

    const handleUniqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditMode) {
            updateEditingColumn({ ...editedColumn, unique: e.target.checked });
        } else {
            onUpdate({ ...column, unique: e.target.checked });
        }
    };

    const handleSave = async () => {
        const dialog = new ConfirmDialog({
            title: '컬럼 저장',
            msg: `컬럼 "${editedColumn.name}"을 저장하시겠습니까?\n\nALTER TABLE ${tableName} MODIFY COLUMN ${editedColumn.name} ${editedColumn.type};`,
            ok: '확인',
            cancel: '취소'
        });
        const confirmed = await dialog.open();
        if (confirmed) {
            onSave({ ...editedColumn, isDetailOpen: false });
        }
    };

    const handleCancel = () => {
        onUpdate({ ...column, isDetailOpen: false });
        if (onCancel) {
            onCancel();
        }
    };

    const handleEdit = () => {
        onUpdate({ ...column, isDetailOpen: true });
        onEdit();
    };

    const handleDelete = async () => {
        const dialog = new ConfirmDialog({
            title: '컬럼 삭제',
            msg: `컬럼 "${column.name}"을 삭제하시겠습니까?`,
            ok: '확인',
            cancel: '취소'
        });
        const confirmed = await dialog.open();
        if (confirmed) {
            onDelete();
            if (mode === 'EDIT') {
                const afterDialog = new ConfirmDialog({
                    title: '삭제 완료',
                    msg: `컬럼 "${column.name}"이 삭제되었습니다\n\nALTER TABLE ${tableName} DROP COLUMN ${column.name}`,
                    ok: '확인',
                    cancel: ''
                });
                await afterDialog.open();
            }
        }
    };

    const toggleDetail = () => {
        if (!isReadOnly) {
            onUpdate({ ...column, isDetailOpen: !isDetailOpen });
        }
    };

    return (
        <>
            <div className={`column-item-container ${isEditing ? 'editing' : ''}`}>
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
                        <option value="uuid">🆔 UUID</option>
                        <option value="auto_increment_id">🔢 Auto Increment ID</option>
                        <option value="created_time">📅 Created Time</option>
                        <option value="text">📝 Text</option>
                        <option value="checkbox">☑️ Checkbox</option>
                        <option value="number">🔢 Number</option>
                        <option value="json">{'{}'} JSON</option>
                        <option value="date">📆 Date</option>
                        <option value="datetime">🕐 DateTime</option>
                        <option value="foreign_key">🔗 Foreign Key</option>
                        <option value="custom">⚙️ Custom</option>
                    </select>
                    <label>
                        <input
                            type="checkbox"
                            checked={isEditMode ? editedColumn.nullable : column.nullable}
                            onChange={handleNotNullChange}
                            disabled={isReadOnly || (isEditMode ? editedColumn.primaryKey : column.primaryKey)}
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
                        {column.preset && column.preset !== 'custom' && PRESET_INFO[column.preset]
                            ? PRESET_INFO[column.preset].defaultType
                            : getTypeDefinition(isEditMode ? editedColumn : column)}
                    </span>
                </div>
                <div className="column-item-actions">
                    {isEditMode ? (
                        isEditing ? (
                            <>
                                <button className='actions-save' onClick={handleSave}>Save</button>
                                <button className='actions-button' onClick={handleCancel}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button className='actions-button' onClick={handleEdit}>Edit</button>
                                <button className='actions-delete' onClick={handleDelete}>Delete</button>
                            </>
                        )
                    ) : (
                        <button className='actions-delete' onClick={handleDelete}>Delete</button>
                    )}
                </div>
            </div>
            {isDetailOpen && (
                <NexaDatabaseColumnDetail
                    column={isEditMode ? editedColumn : column}
                    onUpdate={updateEditingColumn}
                    disabled={isReadOnly}
                />
            )}
        </>
    );
};
