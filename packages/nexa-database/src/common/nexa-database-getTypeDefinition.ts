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

import { ColumnData } from './nexa-database-types';

// 타입 정의만 반환 (TYPE + LENGTH/PRECISION) - 표시용
export function getTypeDefinition(col: ColumnData): string {
    let def = col.type || 'undefined';

    // LENGTH 처리 - length가 있으면 항상 표시
    if (col.length && ['VARCHAR', 'CHAR', 'TINYINT', 'SMALLINT', 'INT', 'BIGINT'].includes(col.type!)) {
        def += `(${col.length})`;
    } else if (col.type === 'DECIMAL' && col.decimalPlaces) {
        const precision = col.precision || String(10 + parseInt(col.decimalPlaces, 10));
        def += `(${precision},${col.decimalPlaces})`;
    }
    if (col.unsigned) {
        def += ' UNSIGNED';
    }
    if (col.autoIncrement) {
        def += ' AUTO_INCREMENT';
    }
    if (col.onUpdateTimestamp) {
        def += ' ON UPDATE CURRENT_TIMESTAMP';
    }

    return def;
}

// ALTER TABLE용 컬럼 정의
export function getAlterColumnDefinition(col: ColumnData): string {
    let def = String(col.type);

    if (col.length) {
        def += `(${col.length})`;
    }
    if (!col.nullable) {
        def += ' NOT NULL';
    }
    if (col.autoIncrement) {
        def += ' AUTO_INCREMENT';
    }
    if (col.unique && col.primaryKey) {
        def += ' UNIQUE';
    }
    if (col.defaultChecked) {
        col.defaultValue = '1';
    }
    if (col.defaultValue) {
        if (col.defaultValue.includes('CURRENT_TIMESTAMP')) {
            def += ` DEFAULT ${col.defaultValue}`;
        } else {
            def += ` DEFAULT '${col.defaultValue}'`;
        }
    }

    return def;
}

// CREATE TABLE용 컬럼 정의 (PK면 UNIQUE 제외)
export function getCreateColumnDefinition(col: ColumnData): string {
    let def = col.type || 'undefined';

    if (col.length) {
        def += `(${col.length})`;
    }
    if (!col.nullable) {
        def += ' NOT NULL';
    }
    if (col.autoIncrement) {
        def += ' AUTO_INCREMENT';
    }
    if (col.unique && !col.primaryKey) {
        def += ' UNIQUE';
    }
    if (col.defaultValue) {
        if (
            col.defaultValue.includes('CURRENT_TIMESTAMP')
        ) {
            def += ` DEFAULT ${col.defaultValue}`;
        } else {
            def += ` DEFAULT '${col.defaultValue}'`;
        }
    }

    return def;
}
