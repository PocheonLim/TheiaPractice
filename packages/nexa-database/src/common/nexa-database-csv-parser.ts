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

export interface ParsedCSVData {
    columns: ColumnData[];
    rows: Array<Record<string, string>>;
}

export function parseCSV(csvText: string): ParsedCSVData {
    const line = csvText.split('\n');
    const lines = line.filter(str => str.trim());

    if (lines.length === 0) {
        return { columns: [], rows: [] };
    }

    const firstLine = lines[0].split(',');
    const headers = firstLine.map(h => h.trim());

    const parsedColumns: ColumnData[] = headers.map(header => ({
        name: header,
        preset: 'text',
        primaryKey: false,
        nullable: true,
        unique: false,
        type: 'TEXT'
    }));

    const parsedRows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
        const value = lines[i].split(',');
        const values = value.map(v => v.trim());
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        parsedRows.push(row);
    }

    return { columns: parsedColumns, rows: parsedRows };
};
