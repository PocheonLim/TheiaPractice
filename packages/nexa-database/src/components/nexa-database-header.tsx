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
import { ColumnData, Mode, RowData } from '../common/nexa-database-types';
import { ConfirmDialog } from '@theia/core/lib/browser/dialogs';
import { parseCSV } from '../common/nexa-database-csv-parser';

export interface NexaDatabaseHeaderProps {
    mode: Mode;
    tableName: string;
    columns: ColumnData[];
    onChangeMode: (mode: Mode) => void;
    onChangeTableName: (name: string) => void;
    onImportCSV: (columns: ColumnData[], rows: RowData[]) => void;
}

export const NexaDatabaseHeader: React.FC<NexaDatabaseHeaderProps> = ({ mode, tableName, columns, onChangeMode, onChangeTableName, onImportCSV }: NexaDatabaseHeaderProps) => {
    const [localTableName, setLocalTableName] = React.useState<string>(tableName);
    const fileInputRef = React.useRef<HTMLInputElement>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newName = e.target.value;
        setLocalTableName(newName);
        if (mode === 'NEW') {
            onChangeTableName(newName);
        }
    };

    const handleRename = (): void => {
        onChangeTableName(localTableName);
    };

    const handleImportClick = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const csvText = event.target?.result as string;
            const { columns: parsedColumns, rows: parsedRows } = parseCSV(csvText);
            onImportCSV(parsedColumns, parsedRows);
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreateSql = (): void => {
        let sql = `CREATE TABLE ${tableName} (\n`;
        const columnDefs = columns.map(col => {
            let def = `  ${col.name} ${col.type}`;
            if (col.nullable) {
                def += ' NOT NULL';
            }
            if (col.unique && !col.primaryKey) {
                def += ' UNIQUE';
            }
            return def;
        });
        sql += columnDefs.join(',\n');
        const pkColumn = columns.find(c => c.primaryKey);
        if (pkColumn) {
            sql += `,\n  PRIMARY KEY (${pkColumn.name})`;
        }
        sql += '\n);';

        const createTableDialog = new ConfirmDialog({
            title: '테이블 ' + { localTableName } + '을 생성하시겠습니까?',
            msg: sql,
            ok: '생성',
            cancel: '취소'
        });

        createTableDialog.open();
    };

    return (
        <div className="nexa-database-header">
            <div className="nexa-database-header-menu">
                <div className="nexa-database-header-left">
                    {mode === 'NEW' ? 'New Table:' : 'Edit Table:'}
                    <input
                        type="text"
                        placeholder="New_table"
                        value={localTableName}
                        onChange={handleInputChange}
                    />
                    {mode === 'EDIT' && <button onClick={handleRename}>Rename</button>}
                </div>

                <div className="nexa-database-header-right">
                    {mode === 'NEW' ? (
                        <>
                            <input
                                ref={fileInputRef as React.LegacyRef<HTMLInputElement>}
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <button onClick={handleImportClick}>📁 Import CSV</button>
                            <button onClick={handleCreateSql} style={{ backgroundColor: '#1e6fff', color: 'white' }}>💾 Create</button>
                            <button onClick={() => onChangeMode('EDIT')}>Switch to Edit</button>
                        </>
                    ) : (
                        <button onClick={() => onChangeMode('NEW')}>Switch to New</button>
                    )}
                </div>
            </div>
            <div className='nexa-database-header-textarea'>
                <textarea placeholder='Add Table Description' />
            </div>
        </div>
    );
};
