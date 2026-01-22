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

import { PresetKey, ColumnData } from './nexa-database-types';

export interface SelectOption {
    value: string;
    label: string;
}

// 프리셋 기본값 타입
// Partial - 모든 속성 옵셔널, Omit - a, ~ - a에서 ~ 속성들 제외한 새로운 타입
export type PresetDefaults = Partial<Omit<ColumnData, 'name' | 'preset' | 'isEditing' | 'isDetailOpen' | 'isNew'>>;

export interface PresetInfo {
    name: string;
    icon: string;
    description: string;
    defaults: PresetDefaults;
    typeOptions?: SelectOption[];
    defaultOptions?: SelectOption[];
    numberTypeOptions?: SelectOption[];
    decimalPlacesOptions?: SelectOption[];
}

// Default mode 옵션
const COMMON_DEFAULT_OPTIONS: SelectOption[] = [
    { value: 'no_default', label: 'No Default' },
    { value: 'default_value', label: 'Default Value' },
    { value: 'sql_expression', label: 'SQL Expression' }
];

// 프리셋 타입 옵션들
const TEXT_TYPE_OPTIONS: SelectOption[] = [
    { value: 'TEXT', label: 'TEXT (default)' },
    { value: 'VARCHAR', label: 'VARCHAR' },
    { value: 'CHAR', label: 'CHAR' },
    { value: 'TINYTEXT', label: 'TINYTEXT' },
    { value: 'MEDIUMTEXT', label: 'MEDIUMTEXT' },
    { value: 'LONGTEXT', label: 'LONGTEXT' }
];

const CHECKBOX_TYPE_OPTIONS: SelectOption[] = [
    { value: 'TINYINT', label: 'TINYINT(1) / BOOLEAN' }
];

const NUMBER_TYPE_OPTIONS: SelectOption[] = [
    { value: 'integer', label: 'Integer' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'float', label: 'Float' }
];

const INTEGER_DB_TYPE_OPTIONS: SelectOption[] = [
    { value: 'SMALLINT', label: 'SMALLINT' },
    { value: 'INT', label: 'INT (default)' },
    { value: 'BIGINT', label: 'BIGINT' }
];

const DECIMAL_DB_TYPE_OPTIONS: SelectOption[] = [
    { value: 'DECIMAL', label: 'DECIMAL' }
];

const FLOAT_DB_TYPE_OPTIONS: SelectOption[] = [
    { value: 'FLOAT', label: 'FLOAT' },
    { value: 'DOUBLE', label: 'DOUBLE (default)' }
];

const DECIMAL_PLACES_OPTIONS: SelectOption[] = [
    { value: '1', label: '1 (1.0)' },
    { value: '2', label: '2 (1.00)' },
    { value: '3', label: '3 (1.000)' },
    { value: '4', label: '4 (1.0000)' },
    { value: '5', label: '5 (1.00000)' },
    { value: '6', label: '6 (1.000000)' },
    { value: '7', label: '7 (1.0000000)' },
    { value: '8', label: '8 (1.00000000)' },
    { value: '9', label: '9 (1.000000000)' },
    { value: '10', label: '10 (1.0000000000)' }
];

const JSON_TYPE_OPTIONS: SelectOption[] = [
    { value: 'JSON', label: 'JSON' }
];

const DATE_TYPE_OPTIONS: SelectOption[] = [
    { value: 'DATE', label: 'DATE' }
];

const DATETIME_TYPE_OPTIONS: SelectOption[] = [
    { value: 'DATETIME', label: 'DATETIME' },
    { value: 'TIMESTAMP', label: 'TIMESTAMP' }
];

const CUSTOM_TYPE_OPTIONS: SelectOption[] = [
    { value: 'VARCHAR', label: 'VARCHAR' },
    { value: 'CHAR', label: 'CHAR' },
    { value: 'BINARY', label: 'BINARY' },
    { value: 'VARBINARY', label: 'VARBINARY' },
    { value: 'TINYTEXT', label: 'TINYTEXT' },
    { value: 'TEXT', label: 'TEXT' },
    { value: 'MEDIUMTEXT', label: 'MEDIUMTEXT' },
    { value: 'LONGTEXT', label: 'LONGTEXT' },
    { value: 'TINYINT', label: 'TINYINT' },
    { value: 'SMALLINT', label: 'SMALLINT' },
    { value: 'MEDIUMINT', label: 'MEDIUMINT' },
    { value: 'INT', label: 'INT' },
    { value: 'BIGINT', label: 'BIGINT' },
    { value: 'DECIMAL', label: 'DECIMAL' },
    { value: 'FLOAT', label: 'FLOAT' },
    { value: 'DOUBLE', label: 'DOUBLE' },
    { value: 'DATE', label: 'DATE' },
    { value: 'DATETIME', label: 'DATETIME' },
    { value: 'TIMESTAMP', label: 'TIMESTAMP' },
    { value: 'TIME', label: 'TIME' },
    { value: 'YEAR', label: 'YEAR' },
    { value: 'JSON', label: 'JSON' },
    { value: 'TINYBLOB', label: 'TINYBLOB' },
    { value: 'BLOB', label: 'BLOB' },
    { value: 'MEDIUMBLOB', label: 'MEDIUMBLOB' },
    { value: 'LONGBLOB', label: 'LONGBLOB' },
    { value: 'ENUM', label: 'ENUM' },
    { value: 'SET', label: 'SET' }
];

export const PRESET_INFO: Record<PresetKey, PresetInfo> = {
    uuid: {
        name: 'UUID',
        icon: '🆔',
        description: 'Universally Unique Identifier (CHAR(36) with UUID() default)',
        defaults: {
            type: 'CHAR',
            dbType: 'CHAR',
            length: '36',
            primaryKey: false,
            nullable: false,
            unique: true,
            defaultMode: 'sql_expression',
            defaultValue: 'UUID()',
            autoIncrement: false,
            unsigned: false
        }
    },
    auto_increment_id: {
        name: 'Auto-incrementing Integer ID',
        icon: '🔢',
        description: 'Auto-incrementing primary key (INT UNSIGNED AUTO_INCREMENT)',
        defaults: {
            type: 'INT',
            dbType: 'INT',
            nullable: false,
            primaryKey: true,
            autoIncrement: true,
            unsigned: true,
        }
    },
    created_time: {
        name: 'Created Time',
        icon: '📅',
        description: 'Record creation timestamp (TIMESTAMP with CURRENT_TIMESTAMP default)',
        defaults: {
            type: 'TIMESTAMP',
            dbType: 'TIMESTAMP',
            primaryKey: false,
            nullable: false,
            defaultMode: 'sql_expression',
            defaultValue: 'CURRENT_TIMESTAMP',
            autoIncrement: false,
            unsigned: false
        }
    },
    text: {
        name: 'TEXT',
        icon: '📝',
        description: 'Text column',
        defaults: {
            type: 'TEXT',
            dbType: 'TEXT',
            primaryKey: false,
            nullable: true,
            unique: false,
            defaultMode: 'no_default',
            defaultValue: '',
            autoIncrement: false,
            unsigned: false
        },
        typeOptions: TEXT_TYPE_OPTIONS,
        defaultOptions: COMMON_DEFAULT_OPTIONS
    },
    checkbox: {
        name: 'Checkbox',
        icon: '☑️',
        description: 'Boolean/Checkbox field',
        defaults: {
            type: 'TINYINT',
            dbType: 'TINYINT',
            length: '1',
            primaryKey: false,
            nullable: true,
            unique: false,
            defaultMode: 'default_value',
            defaultValue: '0',
            defaultChecked: false,
            autoIncrement: false,
            unsigned: false
        },
        typeOptions: CHECKBOX_TYPE_OPTIONS,
        defaultOptions: COMMON_DEFAULT_OPTIONS
    },
    number: {
        name: 'Number',
        icon: '🔢',
        description: 'Numeric column',
        defaults: {
            type: 'INT',
            dbType: 'INT',
            numberType: 'integer',
            primaryKey: false,
            nullable: true,
            unique: false,
            unsigned: false,
            defaultMode: 'default_value',
            defaultValue: '0',
            autoIncrement: false,
        },
        numberTypeOptions: NUMBER_TYPE_OPTIONS,
        decimalPlacesOptions: DECIMAL_PLACES_OPTIONS,
        defaultOptions: COMMON_DEFAULT_OPTIONS
    },
    json: {
        name: 'JSON',
        icon: '{}',
        description: 'JSON data type',
        defaults: {
            type: 'JSON',
            dbType: 'JSON',
            primaryKey: false,
            nullable: true,
            unique: false,
            defaultMode: 'no_default',
            defaultValue: '',
            autoIncrement: false,
            unsigned: false
        },
        typeOptions: JSON_TYPE_OPTIONS,
        defaultOptions: COMMON_DEFAULT_OPTIONS
    },
    date: {
        name: 'Date',
        icon: '📆',
        description: 'Date only (no time)',
        defaults: {
            type: 'DATE',
            dbType: 'DATE',
            primaryKey: false,
            nullable: true,
            unique: false,
            defaultMode: 'no_default',
            defaultValue: '',
            autoIncrement: false,
            unsigned: false
        },
        typeOptions: DATE_TYPE_OPTIONS,
        defaultOptions: COMMON_DEFAULT_OPTIONS
    },
    datetime: {
        name: 'Date + Time',
        icon: '🕐',
        description: 'Date and time',
        defaults: {
            type: 'DATETIME',
            dbType: 'DATETIME',
            primaryKey: false,
            nullable: true,
            unique: false,
            onUpdateTimestamp: false,
            defaultMode: 'sql_expression',
            defaultValue: 'CURRENT_TIMESTAMP',
            autoIncrement: false,
            unsigned: false
        },
        typeOptions: DATETIME_TYPE_OPTIONS,
        defaultOptions: COMMON_DEFAULT_OPTIONS
    },
    foreign_key: {
        name: 'Foreign Key',
        icon: '🔗',
        description: 'Reference to another table',
        defaults: {
            type: undefined,
            dbType: undefined,
            primaryKey: false,
            nullable: true,
            fkTable: '',
            fkColumn: '',
            onDelete: 'NO ACTION',
            onUpdateAction: 'NO ACTION',
            autoIncrement: false,
            unsigned: false
        }
    },
    custom: {
        name: 'Custom',
        icon: '⚙️',
        description: 'Manually configure all options',
        defaults: {
            type: 'VARCHAR',
            dbType: 'VARCHAR',
            length: '255',
            primaryKey: false,
            nullable: true,
            unique: false,
            defaultMode: 'no_default',
            defaultValue: '',
            autoIncrement: false,
            unsigned: false
        },
        typeOptions: CUSTOM_TYPE_OPTIONS,
        defaultOptions: COMMON_DEFAULT_OPTIONS
    }
};

// Number preset의 DB Type 옵션 반환
export function getNumberDbTypeOptions(numberType: string): SelectOption[] {
    switch (numberType) {
        case 'integer':
            return INTEGER_DB_TYPE_OPTIONS;
        case 'decimal':
            return DECIMAL_DB_TYPE_OPTIONS;
        case 'float':
            return FLOAT_DB_TYPE_OPTIONS;
        default:
            return INTEGER_DB_TYPE_OPTIONS;
    }
}

// 프리셋 변경 시 기본값 적용 함수
export function getPresetDefaults(presetKey: PresetKey): PresetDefaults {
    return PRESET_INFO[presetKey]?.defaults || {};
}

// length 필드 타입
export const TYPES_REQUIRING_LENGTH = ['VARCHAR', 'CHAR', 'BINARY', 'VARBINARY'];

// Types that need precision field
export const TYPES_REQUIRING_PRECISION = ['DECIMAL'];

// Numeric types that support unsigned
export const UNSIGNED_SUPPORTED_TYPES = ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE'];

// Types that support auto increment
export const AUTO_INCREMENT_SUPPORTED_TYPES = ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT'];

// Types that support on update timestamp
export const ON_UPDATE_TIMESTAMP_TYPES = ['DATETIME', 'TIMESTAMP'];
