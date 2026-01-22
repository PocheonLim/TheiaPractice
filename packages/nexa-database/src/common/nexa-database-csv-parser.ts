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

import { ColumnData, RowData } from './nexa-database-types';

export interface ParsedCSVData {
    columns: ColumnData[];
    rows: RowData[];
}

interface InferredType {
    type: string;
    length?: number;
    precision?: number;
    decimalPlaces?: number;
    unsigned?: boolean;
}

// 컬럼명 변환: 소문자로 변환, 공백을 _로 변경, 특수문자 제거
function normalizeColumnName(name: string): string {
    return name.trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^(\d)/, '_$1');
}

// 컬럼 타입 추론
function inferColumnType(values: string[]): InferredType {
    const nonNullValues = values.filter(v => v !== undefined && v !== undefined && v !== '');

    if (nonNullValues.length === 0) {
        return { type: 'VARCHAR', length: 255 };
    }

    // Boolean 체크
    const boolValues = nonNullValues.filter(v =>
        ['true', 'false', '1', '0', 'yes', 'no'].includes(String(v).toLowerCase())
    );
    if (boolValues.length === nonNullValues.length) {
        return { type: 'TINYINT', length: 1 };
    }

    // 정수 체크
    const intValues = nonNullValues.filter(v => /^-?\d+$/.test(String(v)));
    if (intValues.length === nonNullValues.length) {
        const nums = intValues.map(v => parseInt(v, 10));
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const unsigned = min >= 0;

        if (unsigned) {
            if (max <= 255) { return { type: 'TINYINT', unsigned: true }; }
            if (max <= 65535) { return { type: 'SMALLINT', unsigned: true }; }
            if (max <= 16777215) { return { type: 'MEDIUMINT', unsigned: true }; }
            if (max <= 4294967295) { return { type: 'INT', unsigned: true }; }
            return { type: 'BIGINT', unsigned: true };
        } else {
            if (min >= -128 && max <= 127) { return { type: 'TINYINT' }; }
            if (min >= -32768 && max <= 32767) { return { type: 'SMALLINT' }; }
            if (min >= -8388608 && max <= 8388607) { return { type: 'MEDIUMINT' }; }
            if (min >= -2147483648 && max <= 2147483647) { return { type: 'INT' }; }
            return { type: 'BIGINT' };
        }
    }

    // 소수 체크
    const floatValues = nonNullValues.filter(v => /^-?\d+\.\d+$/.test(String(v)));
    if (floatValues.length === nonNullValues.length) {
        const maxDecimals = Math.max(...floatValues.map(v => {
            const parts = String(v).split('.');
            return parts[1] ? parts[1].length : 0;
        }));
        return {
            type: 'DECIMAL',
            precision: 10 + maxDecimals,
            decimalPlaces: maxDecimals
        };
    }

    // 날짜 체크
    const dateValues = nonNullValues.filter(v => !isNaN(Date.parse(String(v))));
    if (dateValues.length === nonNullValues.length) {
        const hasTime = dateValues.some(v => String(v).includes(':'));
        return { type: hasTime ? 'DATETIME' : 'DATE' };
    }

    // JSON 체크
    const jsonValues = nonNullValues.filter(v => {
        try {
            JSON.parse(String(v));
            return true;
        } catch {
            return false;
        }
    });
    if (jsonValues.length === nonNullValues.length) {
        return { type: 'JSON' };
    }

    // 문자열 - 길이에 따라 VARCHAR 또는 TEXT
    const maxLength = Math.max(...nonNullValues.map(v => String(v).length));
    if (maxLength <= 255) {
        return { type: 'VARCHAR', length: Math.min(255, maxLength + 50) };
    } else if (maxLength <= 65535) {
        return { type: 'TEXT' };
    } else {
        return { type: 'MEDIUMTEXT' };
    }
}

export function parseCSV(csvText: string): ParsedCSVData {
    const line = csvText.split('\n');
    const lines = line.filter(str => str.trim());

    const firstLine = lines[0].split(',');
    const headers = firstLine.map(h => normalizeColumnName(h));

    // 각 컬럼의 모든 값 수집
    const columnValues: Record<string, string[]> = {};
    headers.forEach(header => {
        columnValues[header] = [];
    });

    const parsedRows: RowData[] = [];
    for (let i = 1; i < lines.length; i++) {
        const value = lines[i].split(',');
        const cellValues = value.map(v => v.trim());
        const rowValues: Record<string, string> = {};

        headers.forEach((header, index) => {
            const cellValue = cellValues[index] || '';
            rowValues[header] = cellValue;
            columnValues[header].push(cellValue);
        });

        parsedRows.push({
            values: rowValues,
            isEditing: false
        });
    }

    // 컬럼 정의 생성 (타입 추론 포함)
    const parsedColumns: ColumnData[] = headers.map((header, idx) => {
        const inferred = inferColumnType(columnValues[header]);
        const isFirstIdColumn = idx === 0 && header === 'id' &&
            ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT'].includes(inferred.type);

        return {
            name: header,
            preset: 'custom',
            primaryKey: isFirstIdColumn,
            nullable: !isFirstIdColumn,
            unique: false,
            type: inferred.type,
            dbType: inferred.type,
            length: inferred.length?.toString(),
            precision: inferred.precision?.toString(),
            decimalPlaces: inferred.decimalPlaces?.toString(),
            unsigned: inferred.unsigned
        };
    });

    return { columns: parsedColumns, rows: parsedRows };
}
