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

import { PresetKey } from './nexa-database-types';

export interface PresetInfo {
    name: string;
    icon: string;
    description: string;
}

export const PRESET_INFO: Record<PresetKey, PresetInfo> = {
    uuid: {
        name: 'UUID',
        icon: '🆔',
        description: 'Universally Unique Identifier (CHAR(36) with UUID() default)'
    },
    auto_increment_id: {
        name: 'Auto-incrementing Integer ID',
        icon: '🔢',
        description: 'Auto-incrementing primary key (INT UNSIGNED AUTO_INCREMENT)'
    },
    created_time: {
        name: 'Created Time',
        icon: '📅',
        description: 'Record creation timestamp (TIMESTAMP with CURRENT_TIMESTAMP default)'
    },
    text: {
        name: 'TEXT',
        icon: '📝',
        description: 'Text column'
    },
    checkbox: {
        name: 'Checkbox',
        icon: '☑️',
        description: 'Boolean/Checkbox field'
    },
    number: {
        name: 'Number',
        icon: '🔢',
        description: 'Numeric column'
    },
    json: {
        name: 'JSON',
        icon: '{}',
        description: 'JSON data type'
    },
    date: {
        name: 'Date',
        icon: '📆',
        description: 'Date only (no time)'
    },
    datetime: {
        name: 'Date + Time',
        icon: '🕐',
        description: 'Date and time'
    },
    foreign_key: {
        name: 'Foreign Key',
        icon: '🔗',
        description: 'Reference to another table'
    },
    custom: {
        name: 'Custom',
        icon: '⚙️',
        description: 'Manually configure all options'
    }
};
