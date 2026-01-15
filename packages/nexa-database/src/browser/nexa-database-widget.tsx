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

import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser';
import * as React from '@theia/core/shared/react';
import { NexaDatabaseHeader } from '../components/nexa-database-header';
import { NexaDatabaseTabbar } from '../components/nexa-database-tabbar';
import { NexaDatabaseColumn } from '../components/nexa-database-column';
import { NexaDatabaseRow } from '../components/nexa-database-row';

import { Mode, ActiveTab, ColumnData, RowData } from '../common/nexa-database-types';

@injectable()
export class NexaDatabaseWidget extends ReactWidget {
    static readonly ID = 'nexaDatabaseWidget';
    static readonly LABEL = 'Nexa Database Widget';

    private mode: Mode = 'NEW';
    private activeTab: ActiveTab = 'COLUMN';
    private columns: ColumnData[] = [];
    private rows: RowData[] = [];
    private tableName: string;

    setMode = (mode: Mode): void => {
        this.mode = mode;
        this.update();
    };

    setActiveTab = (activeTab: ActiveTab): void => {
        this.activeTab = activeTab;
        this.update();
    };

    handleReName = (name: string): void => {
        this.tableName = name;
        this.update();
    };

    handleAddColumn = (): void => {
        const newColumn: ColumnData = {
            name: 'new_column',
            preset: 'uuid',
            primaryKey: false,
            nullable: false,
            unique: false,
            type: 'CHAR'
        };
        this.columns = [...this.columns, newColumn];
        this.update();
    };

    handleUpdateColumn = (index: number, updatedColumn: ColumnData): void => {
        // PK 체크박스 클릭 시: 다른 컬럼의 PK를 자동으로 false 처리
        if (updatedColumn.primaryKey) {
            this.columns = this.columns.map((col, i) =>
                i === index
                    ? updatedColumn
                    : { ...col, primaryKey: false }
            );
        } else {
            // PK가 아닌 경우 (다른 필드 변경 또는 PK 해제)
            this.columns = this.columns.map((col, i) =>
                i === index ? updatedColumn : col
            );
        }
        this.update();
    };

    handleDeleteColumn = (index: number): void => {
        this.columns = this.columns.filter((_, i) => i !== index);
        this.update();
    };

    handleEditColumn = (index: number): void => {
        this.columns = this.columns.map((col, i) => ({
            ...col,
            isEditing: i === index
        }));
        this.update();
    };

    handleSaveColumn = (index: number, updatedColumn: ColumnData): void => {
        // PK 체크박스 클릭 시: 다른 컬럼의 PK를 자동으로 false 처리
        if (updatedColumn.primaryKey) {
            this.columns = this.columns.map((col, i) =>
                i === index
                    ? { ...updatedColumn, isEditing: false }
                    : { ...col, primaryKey: false, isEditing: false }
            );
        } else {
            // PK가 아닌 경우 (다른 필드 변경 또는 PK 해제)
            this.columns = this.columns.map((col, i) =>
                i === index ? { ...updatedColumn, isEditing: false } : col
            );
        }
        this.update();
    };

    handleCancelColumn = (index: number): void => {
        this.columns = this.columns.map((col, i) =>
            i === index ? { ...col, isEditing: false } : col
        );
        this.update();
    };

    handleAddRow = (): void => {
        this.rows = this.rows.map(row => ({ ...row, isEditing: false }));

        const emptyValues: Record<string, string> = {};
        for (const column of this.columns) {
            emptyValues[column.name] = '';
        }
        const newRow: RowData = {
            values: emptyValues,
            isEditing: true
        };
        this.rows = [newRow, ...this.rows];
        this.update();
    };

    handleDeleteRow = (index: number): void => {
        this.rows = this.rows.filter((_, i) => i !== index);
        this.update();
    };

    handleEditRow = (index: number): void => {
        this.rows = this.rows.map((row, i) => ({
            ...row,
            isEditing: i === index
        }));
        this.update();
    };

    handleSaveRow = (index: number, newValues: Record<string, string>): void => {
        this.rows = this.rows.map((row, i) =>
            i === index ? { values: newValues, isEditing: false } : row
        );
        this.update();
    };

    handleCancelRow = (index: number): void => {
        this.rows = this.rows.map((row, i) =>
            i === index ? { ...row, isEditing: false } : row
        );
        this.update();
    };

    handleRefresh = (): void => {
        this.rows.forEach(col => {
            col.isEditing = false;
        });
        this.update();
    };

    handleImportCSV = (columns: ColumnData[], rows: RowData[], append?: boolean): void => {
        if (append) {
            this.columns = [...this.columns, ...columns];
        } else {
            this.columns = columns;
        }
        this.rows = rows;
        this.update();
    };

    handleImportData = (importedRows: RowData[], mode: 'append' | 'replace' | 'upsert'): void => {
        if (mode === 'append') {
            // Append: 기존 데이터 유지하고 새 데이터 추가
            this.rows = [...this.rows, ...importedRows];
        } else if (mode === 'replace') {
            // Replace: 기존 데이터 삭제 후 새 데이터로 교체
            this.rows = importedRows;
        } else if (mode === 'upsert') {
            // Upsert: Primary Key 기준으로 업데이트 또는 삽입 / dialog에서 PK없으면 import 금지
            // 사실 현재 RowData는 value말고 isEditing(import Data 하면 모두 false)이기 때문에 순서 유지말고는 의미 없음
            const pkColumn = this.columns.find(col => col.primaryKey)!;

            const pkName = pkColumn.name;
            const updatedRows = [...this.rows];

            // 각 import 행을 처리
            importedRows.forEach(newRow => {
                const pkValue = newRow.values[pkName];
                const existingIndex = updatedRows.findIndex(row => row.values[pkName] === pkValue);

                if (existingIndex >= 0) {
                    updatedRows[existingIndex] = {
                        values: { ...updatedRows[existingIndex].values, ...newRow.values },
                        isEditing: false,
                    };
                } else {
                    // 새 행 추가
                    updatedRows.push(newRow);
                }
            });
            this.rows = updatedRows;
        }
        this.update();
    };

    @postConstruct()
    init(): void {
        this.id = NexaDatabaseWidget.ID;
        this.title.caption = NexaDatabaseWidget.LABEL;
        this.title.label = NexaDatabaseWidget.LABEL;
        this.title.closable = true;
        this.update();
    }

    protected render(): React.ReactNode {
        return (
            <div className='nexa-database-widget'>
                <NexaDatabaseHeader
                    mode={this.mode}
                    tableName={this.tableName}
                    columns={this.columns}
                    onChangeMode={mode => this.setMode(mode)}
                    onChangeTableName={this.handleReName}
                    onImportCSV={this.handleImportCSV}
                />
                <NexaDatabaseTabbar activeTab={this.activeTab} onChangeActiveTab={activeTab => this.setActiveTab(activeTab)} />
                {this.activeTab === 'COLUMN' ? (
                    <NexaDatabaseColumn
                        tableName={this.tableName}
                        mode={this.mode}
                        columns={this.columns}
                        onAddColumn={this.handleAddColumn}
                        onUpdateColumn={this.handleUpdateColumn}
                        onDeleteColumn={this.handleDeleteColumn}
                        onEditColumn={this.handleEditColumn}
                        onSaveColumn={this.handleSaveColumn}
                        onCancelColumn={this.handleCancelColumn}
                    />
                ) : (
                    <NexaDatabaseRow
                        tableName={this.tableName}
                        columns={this.columns}
                        rows={this.rows}
                        onAddRow={this.handleAddRow}
                        onDeleteRow={this.handleDeleteRow}
                        onEditRow={this.handleEditRow}
                        onSaveRow={this.handleSaveRow}
                        onCancelRow={this.handleCancelRow}
                        onRefresh={this.handleRefresh}
                        onImportData={this.handleImportData}
                    />
                )}
            </div>
        );
    }
}
