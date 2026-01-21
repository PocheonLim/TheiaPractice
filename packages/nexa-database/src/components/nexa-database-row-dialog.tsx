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
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { parseCSV } from '../common/nexa-database-csv-parser';
import { ColumnData, RowData } from '../common/nexa-database-types';
import { NexaDatabaseRowDialogColumn } from './nexa-database-row-dialog-column';
import { ConfirmDialog } from '@theia/core/lib/browser/dialogs';
import { AlertDialog } from '../browser/nexa-database-dialog';

export interface ImportDataResult {
    columns: ColumnData[];
    rows: RowData[];
    mapping: Map<string, string>;
    importMode: string;
}

export interface ImportDialogOptions {
    tableName: string;
    currentColumns: ColumnData[];
    currentRows: RowData[];
}

export class NexaDatabaseRowDialog extends ReactDialog<ImportDataResult> {
    protected file: File | undefined = undefined;
    protected previewData: ImportDataResult | undefined = undefined;
    protected columnMapping: Map<string, string> = new Map();
    protected importMode: 'append' | 'replace' | 'upsert' = 'append';
    protected fileInputRef = React.createRef<HTMLInputElement>();

    protected override async accept(): Promise<void> {
        if (!this.previewData) {
            return;
        }

        const modeText =
            this.importMode === 'append' ? '추가'
                : this.importMode === 'replace' ? '교체'
                    : 'upsert';

        const confirm = new ConfirmDialog({
            title: 'Import Data',
            msg: `${this.previewData.rows.length}개 행을 ${this.options.tableName} 테이블에 ${modeText} 모드로 import 하시겠습니까?`,
            ok: '확인',
            cancel: '취소'
        });

        const confirmed = await confirm.open();

        if (!confirmed) {
            return;
        }

        if (confirmed) {
            await new AlertDialog({
                title: '테이블 이름 변경 완료',
                msg: `✅ ${this.previewData.rows.length}개 행이 성공적으로 import 되었습니다!`,
                ok: '확인'
            }).open();

            super.accept();
        }
    }

    constructor(
        protected readonly options: ImportDialogOptions
    ) {
        super({
            title: `📥 Import Data to "${options.tableName}"`
        });
        this.contentNode.style.minWidth = '80vw';
        this.contentNode.style.minHeight = '40vh';
        this.appendCloseButton('Cancel');
        this.appendAcceptButton('Import Data');
    }

    protected getImportInfoText(): React.ReactNode {
        const rowCount = this.previewData?.rows.length ?? 0;
        switch (this.importMode) {
            case 'append':
                return <>📌 <strong>{rowCount}개 행</strong>이 테이블에 추가됩니다. (기존 데이터 유지)</>;
            case 'replace':
                return <>⚠️ 기존 데이터가 모두 삭제되고, <strong>{rowCount}개 행</strong>이 새로 삽입됩니다.</>;
            case 'upsert':
                return <>🔄 <strong>{rowCount}개 행</strong>이 Upsert됩니다. (중복 키: 업데이트 / 신규: 삽입)</>;
            default:
                return undefined;
        }
    }

    protected render(): React.ReactNode {
        return (
            <div className="import-dialog-content">
                <div className='nexa-database-row-mapping-info'>
                    <div><strong>{this.options.tableName}</strong> 테이블에 데이터를 import합니다.</div>
                    <div>현재 컬럼 수: {this.options.currentColumns.length}개</div>
                    <div>컬럼: {this.options.currentColumns.map(col => col.name).join(', ')}</div>
                </div>

                <div className="nexa-database-row-mapping-upload">
                    <h3>Step 1: Upload CSV File</h3>
                    <input
                        ref={this.fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={this.handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <div className='nexa-database-row-mapping-upload-set'>
                        <button onClick={this.handleChooseFileClick}>📂 Choose CSV File</button>
                        {this.file && <span className="nexa-database-row-mapping-upload-filename">{this.file.name} ({this.previewData?.rows.length ?? 0} rows)</span>}
                    </div>
                </div>

                {this.previewData && (
                    <div className='nexa-database-row-column-mapping'>
                        <h3>Step 2: Column Mapping </h3>
                        <div className='nexa-database-row-mapping-grid-container'>
                            <div className='nexa-database-row-mapping-grid-container-header'>
                                <div>CSV COLUMN</div>
                                <div>TABLE COLUMN</div>
                                <div>STATUS</div>
                                <div>PREVIEW</div>
                            </div>
                            <div className='nexa-database-row-mapping-grid-content'>
                                {this.previewData.columns.map(csvCol => {
                                    const previewValues = this.previewData!.rows
                                        .slice(0, 3)
                                        .map(row => row.values[csvCol.name] ?? '');
                                    return (
                                        <NexaDatabaseRowDialogColumn
                                            key={csvCol.name}
                                            csvColumn={csvCol}
                                            tableColumns={this.options.currentColumns}
                                            selectedTableColumn={this.columnMapping.get(csvCol.name)}
                                            previewValues={previewValues}
                                            onMappingChange={this.handleMappingChange}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className='mapping-info'>
                            매핑 완료: <strong>{this.columnMapping.size}개</strong> / 건너뛰기: <strong>{this.previewData.columns.length - this.columnMapping.size}개</strong>
                            / 총 CSV 컬럼: <strong>{this.previewData.columns.length}개</strong>
                        </div>
                        <h3>Step 3: Import Mode</h3>
                        <div className='nexa-database-row-mapping-import-mode-options'>
                            <label className='nexa-database-row-mapping-radio-option'>
                                <input
                                    type='radio'
                                    name='importMode'
                                    value='append'
                                    checked={this.importMode === 'append'}
                                    onChange={this.handleImportModeChange}
                                />
                                <div className='nexa-database-row-mapping-radio-option-content'>
                                    <strong>Append</strong>
                                    <span>기존 데이터 유지하고 새 데이터 추가</span>
                                </div>
                            </label>
                            <label className='nexa-database-row-mapping-radio-option'>
                                <input
                                    type='radio'
                                    name='importMode'
                                    value='replace'
                                    checked={this.importMode === 'replace'}
                                    onChange={this.handleImportModeChange}
                                />
                                <div className='nexa-database-row-mapping-radio-option-content'>
                                    <strong>Replace</strong>
                                    <p>기존 데이터 삭제 후 새 데이터로 교체</p>
                                </div>
                            </label>
                            <label className='nexa-database-row-mapping-radio-option'>
                                <input
                                    type='radio'
                                    name='importMode'
                                    value='upsert'
                                    checked={this.importMode === 'upsert'}
                                    onChange={this.handleImportModeChange}
                                    disabled={!this.options.currentColumns.some(col => col.primaryKey)}
                                />
                                <div className='nexa-database-row-mapping-radio-option-content'>
                                    <strong>Upsert</strong>
                                    <span>중복 키 업데이트, 없으면 삽입</span>
                                </div>
                            </label>
                        </div>
                        {this.importMode === 'upsert' && (
                            <div>
                                <strong>Primary Key: </strong>
                                {this.options.currentColumns.find(col => col.primaryKey)?.name || '어차피 없으면 클릭 못함'}
                            </div>
                        )}
                        {this.importMode && (
                            <div className='nexa-database-row-mapping-import-info'>
                                <div>{this.getImportInfoText()}</div>
                                <div>매핑된 컬럼: <strong>{this.columnMapping.size}개</strong></div>
                            </div>
                        )}
                    </div>
                )}
                <hr></hr>
            </div>
        );
    }

    protected handleChooseFileClick = (): void => {
        this.fileInputRef.current?.click();
    };

    protected handleMappingChange = (csvColumnName: string, tableColumnName: string | undefined): void => {
        if (tableColumnName) {
            this.columnMapping.set(csvColumnName, tableColumnName);
        } else {
            this.columnMapping.delete(csvColumnName);
        }
        this.update();
    };

    protected handleImportModeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.importMode = e.target.value as 'append' | 'replace' | 'upsert';
        this.update();
    };

    protected handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        this.file = file;
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const csvText = event.target?.result as string;
            const { columns, rows } = parseCSV(csvText);
            this.previewData = { columns, rows, mapping: new Map(), importMode: this.importMode };
            this.columnMapping = this.autoMapColumns(columns, this.options.currentColumns);
            this.update();
        };
        reader.readAsText(file);
    };

    protected autoMapColumns(csvColumns: ColumnData[], tableColumns: ColumnData[]): Map<string, string> {
        const mapping = new Map<string, string>();

        csvColumns.forEach(csvCol => {
            const csvName = csvCol.name.toLowerCase();

            // 1순위: 정확히 일치
            let matched = tableColumns.find(tc => tc.name.toLowerCase() === csvName);

            // 2순위: 정규화 후 일치 (언더스코어, 공백, 하이픈 무시)
            if (!matched) {
                const csvNorm = csvName.replace(/[_\s-]/g, '');
                matched = tableColumns.find(tc => tc.name.toLowerCase().replace(/[_\s-]/g, '') === csvNorm);
            }

            // 3순위: 포함 관계
            if (!matched) {
                matched = tableColumns.find(tc => {
                    const tcName = tc.name.toLowerCase();
                    return tcName.includes(csvName) || csvName.includes(tcName);
                });
            }

            if (matched) {
                mapping.set(csvCol.name, matched.name);
            }
        });

        return mapping;
    }

    get value(): ImportDataResult {
        return this.previewData ? {
            ...this.previewData,
            mapping: this.columnMapping,
            importMode: this.importMode
        } : {
            columns: [],
            rows: [],
            mapping: new Map(),
            importMode: this.importMode
        };
    }
}
