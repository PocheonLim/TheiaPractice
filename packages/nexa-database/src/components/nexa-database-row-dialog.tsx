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
    protected importMode: 'append' | 'replace' | 'upsert';

    constructor(
        protected readonly options: ImportDialogOptions
    ) {
        super({
            title: `Import Data to "${options.tableName}"`
        });
        this.contentNode.style.minWidth = '1000px';
        this.contentNode.style.minHeight = '600px';
        this.appendCloseButton('Cancel');
        this.appendAcceptButton('Import Data');
    }

    protected render(): React.ReactNode {
        return (
            <div className="import-dialog-content">
                <div className='info-csv'>
                    <div><strong>{this.options.tableName} </strong>테이블에 데이터를 import합니다.</div>
                    <div>현재 컬럼 수: {this.options.currentColumns.length}개</div>
                    <div>컬럼: {this.options.currentColumns.map(col => col.name).join(', ')}</div>
                </div>

                <div className="file-upload-section">
                    <h3>Step 1: Upload CSV File</h3>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={this.handleFileChange}
                    />
                </div>

                {this.previewData && (
                    <div>
                        <hr></hr>
                        <p>Step 2: Column Mapping</p>
                        <div className='nexa-database-row-mapping-grid-container'>
                            <div className='nexa-database-row-mapping-grid-container-header'>
                                <div>CSV COLUMN</div>
                                <div>TABLE COLUMN</div>
                                <div>STATUS</div>
                                <div>PREVIEW</div>
                            </div>
                            <div className='nexa-database-row-mapping-grid-content'>
                                {this.previewData.columns.map(csvCol => {
                                    const previewRow = this.previewData!.rows[0];
                                    const previewValue = previewRow.values[csvCol.name];
                                    return (
                                        <NexaDatabaseRowDialogColumn
                                            csvColumn={csvCol}
                                            tableColumns={this.options.currentColumns}
                                            selectedTableColumn={this.columnMapping.get(csvCol.name)}
                                            previewData={previewValue}
                                            onMappingChange={this.handleMappingChange}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <hr></hr>
                        <h3>Step 3: Import Mode</h3>
                        <div className='import-mode-options'>
                            <label className='radio-option'>
                                <input
                                    type='radio'
                                    name='importMode'
                                    value='append'
                                    checked={this.importMode === 'append'}
                                    onChange={this.handleImportModeChange}
                                />
                                <div className='radio-option-content'>
                                    <strong>Append</strong>
                                    <span>기존 데이터 유지하고 새 데이터 추가</span>
                                </div>
                            </label>
                            <label className='radio-option'>
                                <input
                                    type='radio'
                                    name='importMode'
                                    value='replace'
                                    checked={this.importMode === 'replace'}
                                    onChange={this.handleImportModeChange}
                                />
                                <div className='radio-option-content'>
                                    <strong>Replace</strong>
                                    <span>기존 데이터 삭제 후 새 데이터로 교체</span>
                                </div>
                            </label>
                            <label className='radio-option'>
                                <input
                                    type='radio'
                                    name='importMode'
                                    value='upsert'
                                    checked={this.importMode === 'upsert'}
                                    onChange={this.handleImportModeChange}
                                    disabled={!this.options.currentColumns.some(col => col.primaryKey)}
                                />
                                <div className='radio-option-content'>
                                    <strong>Upsert</strong>
                                    <span>중복 키 업데이트, 없으면 삽입</span>
                                </div>
                            </label>
                        </div>
                        {/* Upsert 모드 선택 시 Primary Key 정보 표시 */}
                        {this.importMode === 'upsert' && (
                            <div>
                                <strong>Primary Key: </strong>
                                {this.options.currentColumns.find(col => col.primaryKey)?.name || '어차피 없으면 클릭 못함'}
                            </div>
                        )}
                    </div>
                )}
                <hr></hr>
            </div>
        );
    }

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
            this.columnMapping.clear();
            this.update();
        };
        reader.readAsText(file);
    };

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
