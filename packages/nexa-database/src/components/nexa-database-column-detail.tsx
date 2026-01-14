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

// 임시 테이블 데이터
const availableTables = [
    {
        name: 'users',
        columns: [
            { name: 'id', type: 'INT', isUnique: true },
            { name: 'email', type: 'VARCHAR(255)', isUnique: true },
            { name: 'username', type: 'VARCHAR(100)', isUnique: false }
        ]
    },
    {
        name: 'posts',
        columns: [
            { name: 'id', type: 'INT', isUnique: true },
            { name: 'uuid', type: 'CHAR(36)', isUnique: true },
            { name: 'title', type: 'VARCHAR(255)', isUnique: false }
        ]
    }
];

export const NexaDatabaseColumnDetail: React.FC<NexaDatabaseColumnDetailProps> = ({
    column,
    onUpdate,
    disabled = false
}) => {
    const presetInfo = column.preset ? PRESET_INFO[column.preset] : undefined;

    // uuid, auto_increment_id, created_time, foreign_key는 옵션 select를 보여주지 않음
    const shouldShowOptions = column.preset &&
        !['uuid', 'auto_increment_id', 'created_time', 'foreign_key'].includes(column.preset);

    // 프리셋별 조건
    const isCheckboxPreset = column.preset === 'checkbox';
    const isNumberPreset = column.preset === 'number';
    const isDatetimePreset = column.preset === 'datetime';
    const isForeignPreset = column.preset === 'foreign_key';
    const isCustomPreset = column.preset === 'custom';

    // Foreign Key 관련 state
    const [selectedTable, setSelectedTable] = React.useState<string>('');

    const handlePrimaryKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, primaryKey: e.target.checked });
    };

    const handleNullableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, nullable: e.target.checked });
    };

    const handleUniqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, unique: e.target.checked });
    };

    const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTable(e.target.value);
    };

    // 선택된 테이블의 컬럼 목록 가져오기
    const selectedTableData = availableTables.find(table => table.name === selectedTable);
    const availableColumns = selectedTableData?.columns || [];

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
                {isCheckboxPreset && (
                    <div className='column-detail-button'>
                        <input
                            type="checkbox"
                            disabled={disabled}
                        />
                        Default Checked
                    </div>
                )}
                {isNumberPreset && (
                    <div className='column-detail-button'>
                        <input
                            type="checkbox"
                            disabled={disabled}
                        />
                        Unsigned (양수만)
                    </div>
                )}
                {isDatetimePreset && (
                    <div className='column-detail-button'>
                        <input
                            type="checkbox"
                            disabled={disabled}
                        />
                        On Update Timestamp
                    </div>
                )}
            </div>
            {shouldShowOptions && (
                <div className='column-detail-option-container'>
                    <select>
                        <option value="json">JSON</option>
                        <option value="date">Date</option>
                    </select>
                    <select>
                        <option value="no">No Default</option>
                        <option value="default">Default Value</option>
                        <option value="sql">SQL Expression</option>
                    </select>
                    {isNumberPreset && (
                        <>
                            <select>
                                <option value="int">Integer</option>
                                <option value="dec">Decimal</option>
                                <option value="float">Float</option>
                            </select>
                            <input type='text' placeholder='e.g., 0, 100, -50'></input>
                        </>
                    )}
                    {isDatetimePreset && (
                        <input type='text' placeholder='CURRENT_TIMESTAMP'></input>
                    )}
                    {isCustomPreset && (
                        <>
                            <input type='text' placeholder='e.g., 255'></input>
                        </>
                    )}
                </div>
            )}
            {isForeignPreset && (
                <div className='column-detail-option-foreignkey'>
                    <select value={selectedTable} onChange={handleTableChange} disabled={disabled}>
                        <option value="">Select Table...</option>
                        {availableTables.map(table => (
                            <option value={table.name}>
                                {table.name}
                            </option>
                        ))}
                    </select>
                    <select
                        disabled={disabled || !selectedTable}
                    >
                        <option value="">Select Column...</option>
                        {availableColumns.map(col => (
                            <option
                                value={col.name}
                                disabled={!col.isUnique}
                            >
                                {col.name} ({col.type}) {!col.isUnique ? '- Not unique' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div className='column-detail-comment'>
                COMMENT
                <textarea placeholder='Add column description or notes...' />
            </div>
        </div>
    );
};
