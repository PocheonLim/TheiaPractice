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
import { AlertDialog } from '../browser/nexa-database-dialog';
import { parseCSV } from '../common/nexa-database-csv-parser';
import { getCreateColumnDefinition } from '../common/nexa-database-getTypeDefinition';

export interface NexaDatabaseHeaderProps {
    mode: Mode;
    tableName: string;
    tableDescription: string;
    columns: ColumnData[];
    onChangeMode: (mode: Mode) => void;
    onChangeTableName: (name: string) => void;
    onChangeTableDescription: (description: string) => void;
    onImportCSV: (columns: ColumnData[], rows: RowData[], append?: boolean) => void;
}

export const NexaDatabaseHeader: React.FC<NexaDatabaseHeaderProps> = ({
    mode, tableName, tableDescription, columns, onChangeMode, onChangeTableName, onChangeTableDescription, onImportCSV
}: NexaDatabaseHeaderProps) => {
    const [localTableName, setLocalTableName] = React.useState<string>(tableName);
    const [localDescription, setLocalDescription] = React.useState<string>(tableDescription);
    const fileInputRef = React.useRef<HTMLInputElement>();

    // props 변경 시 local state 동기화
    React.useEffect(() => {
        setLocalDescription(tableDescription);
    }, [tableDescription]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newName = e.target.value;
        setLocalTableName(newName);
        if (mode === 'NEW') {
            onChangeTableName(newName);
        }
    };

    const handleRename = async () => {
        if (localTableName === tableName) {
            new AlertDialog({
                title: '알림',
                msg: '변경된 이름이 없습니다.',
                ok: '확인'
            }).open();
            return;
        }
        const changeNameDialog = new ConfirmDialog({
            title: '테이블 이름 변경',
            msg: `테이블 이름을 변경하시겠습니까?\n\nALTER TABLE "${tableName}" RENAME TO "${localTableName}";`,
            ok: '확인',
            cancel: '취소'
        });
        const result = await changeNameDialog.open() ?? false;
        if (result) {
            onChangeTableName(localTableName);
            new AlertDialog({
                title: '테이블 이름 변경 완료',
                msg: `✅ 테이블 이름이 "${tableName}"에서 "${localTableName}"(으)로 변경되었습니다.`,
                ok: '확인'
            }).open();
        }
    };

    const handleImportClick = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const fileName = file.name.toLowerCase().replace(/\.csv$/, '');
        const hasExistingColumns = columns.length > 0;

        const reader = new FileReader();
        reader.onload = async (event: ProgressEvent<FileReader>) => {
            const csvText = event.target?.result as string;
            const { columns: parsedColumns, rows: parsedRows } = parseCSV(csvText);

            let shouldReplace = false;

            if (hasExistingColumns) {
                const replaceDialog = new ConfirmDialog({
                    title: '컬럼 교체',
                    msg: '기존 컬럼을 CSV 파일의 컬럼으로 교체하시겠습니까?',
                    ok: '교체',
                    cancel: '추가'
                });
                shouldReplace = await replaceDialog.open() ?? false;
            }

            const appendMode = !shouldReplace;

            const renameDialog = new ConfirmDialog({
                title: '테이블명 변경',
                msg: `테이블명을 "${fileName}"로 변경하시겠습니까?`,
                ok: '변경',
                cancel: '취소'
            });
            const shouldRename = await renameDialog.open();

            if (shouldRename) {
                setLocalTableName(fileName);
                onChangeTableName(fileName);
            }

            onImportCSV(parsedColumns, parsedRows, appendMode);

            new AlertDialog({
                title: 'CSV 파일 로드 완료',
                msg: `✅ CSV 파일 로드 완료!\n\n${parsedColumns.length}개 컬럼, ${parsedRows.length}개 데이터 행이 추가되었습니다.`,
                ok: '확인'
            }).open();
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreateSql = async () => {
        let sql = `CREATE TABLE ${tableName} (\n`;
        const columnDefs = columns.map(col => `  ${col.name} ${getCreateColumnDefinition(col)}`);
        sql += columnDefs.join(',\n');
        const pkColumn = columns.find(c => c.primaryKey);
        if (pkColumn) {
            sql += `,\n  PRIMARY KEY (${pkColumn.name})`;
        }
        sql += '\n);';

        let sqlCreate = false;

        const createTableDialog = new ConfirmDialog({
            title: `테이블 ${tableName}을 생성하시겠습니까?`,
            msg: sql,
            ok: '생성',
            cancel: '취소'
        });
        sqlCreate = await createTableDialog.open() ?? false;

        if (sqlCreate) {
            new AlertDialog({
                title: '테이블 생성 완료',
                msg: '✅ 테이블이 생성되었습니다!\n\n자세한 내용은 콘솔을 확인하세요.',
                ok: '확인'
            }).open();
        }
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
                        onChange={handleNameChange}
                    />
                    {mode === 'EDIT' && <button onClick={handleRename}>✓ Rename</button>}
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
                <textarea
                    placeholder='Add Table Description'
                    value={localDescription}
                    onChange={e => {
                        setLocalDescription(e.target.value);
                        onChangeTableDescription(e.target.value);
                    }}
                />
            </div>
        </div>
    );
};
