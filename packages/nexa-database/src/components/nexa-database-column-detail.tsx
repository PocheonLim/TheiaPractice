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
import {
    PRESET_INFO,
    getNumberDbTypeOptions,
    TYPES_REQUIRING_LENGTH,
    TYPES_REQUIRING_PRECISION,
    ON_UPDATE_TIMESTAMP_TYPES
} from '../common/nexa-database-presets';

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
    const isTextPreset = column.preset === 'text';
    const isCheckboxPreset = column.preset === 'checkbox';
    const isNumberPreset = column.preset === 'number';
    const isDatetimePreset = column.preset === 'datetime';
    const isForeignPreset = column.preset === 'foreign_key';
    const isCustomPreset = column.preset === 'custom';

    // Local state for dynamic fields
    const [selectedType, setSelectedType] = React.useState<string>(presetInfo?.defaultType || '');
    const [numberType, setNumberType] = React.useState<string>('integer');
    const [defaultMode, setDefaultMode] = React.useState<string>('no_default');

    // Foreign Key 관련 state
    const [selectedTable, setSelectedTable] = React.useState<string>('');

    // 타입에 따라 Length 필드 표시 여부
    const shouldShowLength = (isTextPreset && TYPES_REQUIRING_LENGTH.includes(selectedType)) ||
        (isCustomPreset && TYPES_REQUIRING_LENGTH.includes(selectedType));

    // Custom preset에서 DECIMAL 선택 시 Precision 필드 표시
    const shouldShowPrecision = isCustomPreset && TYPES_REQUIRING_PRECISION.includes(selectedType);

    // Number preset에서 decimal 선택 시 Decimal Places 필드 표시
    const shouldShowDecimalPlaces = isNumberPreset && numberType === 'decimal';

    // Number preset의 Database Type 옵션 (number_type에 따라 변경)
    const numberDbTypeOptions = getNumberDbTypeOptions(numberType);

    // Default mode에 따른 입력 필드 표시
    const shouldShowDefaultValue = defaultMode === 'default_value';
    const shouldShowSqlExpression = defaultMode === 'sql_expression';

    // On Update Timestamp 체크박스 표시 여부
    const shouldShowOnUpdateTimestamp = isDatetimePreset ||
        (isCustomPreset && ON_UPDATE_TIMESTAMP_TYPES.includes(selectedType));

    const handlePrimaryKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isPK = e.target.checked;
        // PK인 경우 nullable은 자동으로 false
        onUpdate({ ...column, primaryKey: isPK, nullable: isPK ? false : column.nullable });
    };

    const handleNullableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, nullable: e.target.checked });
    };

    const handleUniqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...column, unique: e.target.checked });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value);
    };

    const handleNumberTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newNumberType = e.target.value;
        setNumberType(newNumberType);
        // number_type 변경 시 기본 database type 설정
        if (newNumberType === 'integer') {
            setSelectedType('INT');
        } else if (newNumberType === 'decimal') {
            setSelectedType('DECIMAL');
        } else if (newNumberType === 'float') {
            setSelectedType('DOUBLE');
        }
    };

    const handleDefaultModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDefaultMode(e.target.value);
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
                        disabled={disabled || column.primaryKey}
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
                {isNumberPreset && (
                    <div className='column-detail-button'>
                        <input
                            type="checkbox"
                            disabled={disabled}
                        />
                        Unsigned (양수만)
                    </div>
                )}
                {shouldShowOnUpdateTimestamp && (
                    <div className='column-detail-button'>
                        <input
                            type="checkbox"
                            disabled={disabled}
                        />
                        On Update Timestamp
                    </div>
                )}
            </div>

            {/* Number preset */}
            {isNumberPreset && presetInfo && (
                <div className='column-detail-option-container'>
                    {/* Number Type 선택 (integer, decimal, float) */}
                    <div className='column-detail-option-container-menu'>
                        NUMBER TYPE
                        <select value={numberType} onChange={handleNumberTypeChange} disabled={disabled}>
                            {presetInfo.numberTypeOptions?.map(opt => (
                                <option value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Decimal Places (decimal 선택 시에만) */}
                    {shouldShowDecimalPlaces && (
                        <div className='column-detail-option-container-menu'>
                            DECIMAL PLACES
                            <select disabled={disabled}>
                                {presetInfo.decimalPlacesOptions?.map(opt => (
                                    <option value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Database Type (number_type에 따라 옵션 변경) */}
                    <div className='column-detail-option-container-menu'>
                        DATABASE TYPE
                        <select value={selectedType} onChange={handleTypeChange} disabled={disabled}>
                            {numberDbTypeOptions.map(opt => (
                                <option value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Default 선택 */}
                    {presetInfo.defaultOptions && (
                        <div className='column-detail-option-container-menu'>
                            DEFAULT
                            <select value={defaultMode} onChange={handleDefaultModeChange} disabled={disabled}>
                                {presetInfo.defaultOptions.map(opt => (
                                    <option value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Default Value 입력 (default_value 모드일 때) */}
                    {shouldShowDefaultValue && (
                        <div className='column-detail-option-container-menu'>
                            DEFAULT VALUE
                            <input type='text' placeholder='e.g., 0, 100, -50' disabled={disabled} />
                        </div>
                    )}

                    {/* SQL Expression 입력 (sql_expression 모드일 때) */}
                    {shouldShowSqlExpression && (
                        <div className='column-detail-option-container-menu'>
                            SQL EXPRESSION
                            <input type='text' placeholder='e.g., FLOOR(RAND() * 100)' disabled={disabled} />
                        </div>
                    )}
                </div>
            )}

            {/* Checkbox preset */}
            {isCheckboxPreset && presetInfo && (
                <div className='column-detail-option-container'>
                    {presetInfo.typeOptions && (
                        <div className='column-detail-option-container-menu'>
                            DATABASE TYPE
                            <select disabled={disabled}>
                                {presetInfo.typeOptions.map(opt => (
                                    <option value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {presetInfo.defaultOptions && (
                        <div className='column-detail-option-container-menu'>
                            DEFAULT
                            <select value={defaultMode} onChange={handleDefaultModeChange} disabled={disabled}>
                                {presetInfo.defaultOptions.map(opt => (
                                    <option value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Default Checked (default_value 모드일 때) */}
                    {shouldShowDefaultValue && (
                        <div className='column-detail-button'>
                            <input type="checkbox" disabled={disabled} />
                            Default Checked
                        </div>
                    )}

                    {/* SQL Expression 입력 (sql_expression 모드일 때) */}
                    {shouldShowSqlExpression && (
                        <div className='column-detail-option-container-menu'>
                            SQL EXPRESSION
                            <input type='text' placeholder='e.g., TRUE' disabled={disabled} />
                        </div>
                    )}
                </div>
            )}

            {/* Text, JSON, Date, Datetime, Custom presets - 일반적인 구조 */}
            {shouldShowOptions && !isNumberPreset && !isCheckboxPreset && presetInfo && (
                <div className='column-detail-option-container'>
                    {/* Database Type 선택 */}
                    {presetInfo.typeOptions && (
                        <div className='column-detail-option-container-menu'>
                            DATABASE TYPE
                            <select value={selectedType} onChange={handleTypeChange} disabled={disabled}>
                                {presetInfo.typeOptions.map(opt => (
                                    <option value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Length 입력 (VARCHAR, CHAR 등일 때만) */}
                    {shouldShowLength && (
                        <div className='column-detail-option-container-menu'>
                            LENGTH
                            <input type='text' placeholder='e.g., 255' disabled={disabled} />
                        </div>
                    )}

                    {/* Precision 입력 (DECIMAL일 때만 - Custom preset) */}
                    {shouldShowPrecision && (
                        <div className='column-detail-option-container-menu'>
                            PRECISION
                            <input type='text' placeholder='e.g., 10,2' disabled={disabled} />
                        </div>
                    )}

                    {/* Default 선택 */}
                    {presetInfo.defaultOptions && (
                        <div className='column-detail-option-container-menu'>
                            DEFAULT
                            <select value={defaultMode} onChange={handleDefaultModeChange} disabled={disabled}>
                                {presetInfo.defaultOptions.map(opt => (
                                    <option value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Default Value 입력 (default_value 모드일 때) */}
                    {shouldShowDefaultValue && (
                        <div className='column-detail-option-container-menu'>
                            DEFAULT VALUE
                            <input type='text' placeholder={getDefaultValuePlaceholder(column.preset)} disabled={disabled} />
                        </div>
                    )}

                    {/* SQL Expression 입력 (sql_expression 모드일 때) */}
                    {shouldShowSqlExpression && (
                        <div className='column-detail-option-container-menu'>
                            SQL EXPRESSION
                            <input type='text' placeholder={getSqlExpressionPlaceholder(column.preset)} disabled={disabled} />
                        </div>
                    )}
                </div>
            )}

            {/* Foreign Key preset */}
            {isForeignPreset && (
                <div className='column-detail-option-foreignkey'>
                    <div className='column-detail-option-container-menu'>
                        FOREIGN KEY CONFIGURATION
                        <select value={selectedTable} onChange={handleTableChange} disabled={disabled}>
                            <option value="">Select Table...</option>
                            {availableTables.map(table => (
                                <option value={table.name}>
                                    {table.name}
                                </option>
                            ))}
                        </select>
                        <select disabled={disabled || !selectedTable}>
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
                    <div className='column-detail-option-foreignkey-flex'>
                        <div className='column-detail-option-container-menu'>
                            ON DELETE
                            <select disabled={disabled}>
                                <option value="NO ACTION">No Action</option>
                                <option value="RESTRICT">Restrict</option>
                                <option value="CASCADE">Cascade</option>
                                <option value="SET NULL">Set Null</option>
                            </select>
                        </div>
                        <div className='column-detail-option-container-menu'>
                            ON UPDATE
                            <select disabled={disabled}>
                                <option value="NO ACTION">No Action</option>
                                <option value="RESTRICT">Restrict</option>
                                <option value="CASCADE">Cascade</option>
                                <option value="SET NULL">Set Null</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className='column-detail-comment'>
                COMMENT
                <textarea placeholder='Add column description or notes...' disabled={disabled} />
            </div>
        </div>
    );
};

// Helper function for default value placeholder based on preset
function getDefaultValuePlaceholder(preset?: string): string {
    switch (preset) {
        case 'text':
            return "e.g., 'default text'";
        case 'json':
            return 'e.g., {}, [], {"key": "value"}';
        case 'date':
            return "e.g., '2024-01-01'";
        case 'datetime':
            return "e.g., '2024-01-01 12:00:00'";
        default:
            return 'Enter default value';
    }
}

// Helper function for SQL expression placeholder based on preset
function getSqlExpressionPlaceholder(preset?: string): string {
    switch (preset) {
        case 'json':
            return "e.g., (JSON_OBJECT('key', 'value'))";
        case 'date':
            return 'e.g., CURDATE()';
        case 'datetime':
            return 'e.g., CURRENT_TIMESTAMP';
        default:
            return 'Enter SQL expression';
    }
}
