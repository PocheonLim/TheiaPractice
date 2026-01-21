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
import { ConfirmDialog } from '@theia/core/lib/browser/dialogs';

export interface NexaDatabaseRowItemProps {
    columns: ColumnData[];
    rowData: RowData;
    onEdit: () => void;
    onSave: (newValues: Record<string, string>) => void;
    onCancel: () => void;
    onDelete: () => void;
}

export const NexaDatabaseRowItem: React.FC<NexaDatabaseRowItemProps> = ({ columns, rowData, onEdit, onSave, onCancel, onDelete }) => {
    // 현재 편집 중인 값을 로컬 상태로 관리
    const [editedValues, setEditedValues] = React.useState<Record<string, string>>(rowData.values);

    // rowData가 변경되면 editedValues도 업데이트
    React.useEffect(() => {
        setEditedValues(rowData.values);
    }, [rowData.values]);

    const isEditing = rowData.isEditing || false;

    const handleInputChange = (columnName: string, newValue: string) => {
        setEditedValues({
            ...editedValues,
            [columnName]: newValue
        });
    };

    const handleSave = () => {
        onSave(editedValues);
    };

    const handleCancel = () => {
        setEditedValues(rowData.values);
        onCancel();
    };

    const handleDelete = async () => {
        const dialog = new ConfirmDialog({
            title: '로우 삭제',
            msg: 'Delete this row?',
            ok: '삭제',
            cancel: '취소'
        });
        const confirmed = await dialog.open();
        if (confirmed) {
            onDelete();
        }
    };

    return (
        <div className={`nexa-database-row-item ${isEditing ? 'editing' : ''}`}>
            {columns.map(column => {
                const value = editedValues[column.name] ?? '';
                return (
                    <div key={column.name} className='nexa-database-row-item-cell'>
                        {isEditing ? (
                            <input
                                type='text'
                                value={value}
                                onChange={e => handleInputChange(column.name, e.target.value)}
                            />
                        ) : (
                            <span>{value}</span>
                        )}
                    </div>
                );
            })}
            <div className='nexa-database-row-item-action'>
                {isEditing ? (
                    <>
                        <button className='actions-save' onClick={handleSave}>Save</button>
                        <button className='actions-button' onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <>
                        <button className='actions-button' onClick={onEdit}>Edit</button>
                        <button className='actions-delete' onClick={handleDelete}>Delete</button>
                    </>
                )}
            </div>
        </div>
    );
};
