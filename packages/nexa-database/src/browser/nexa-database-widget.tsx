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
        this.columns = this.columns.map((col, i) =>
            i === index ? updatedColumn : col
        );
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
        this.columns = this.columns.map((col, i) =>
            i === index ? { ...updatedColumn, isEditing: false } : col
        );
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

    handleImportCSV = (columns: ColumnData[], rows: Array<Record<string, string>>): void => {
        this.columns = columns;
        this.rows = rows.map(values => ({ values, isEditing: false }));
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
                        columns={this.columns}
                        rows={this.rows}
                        onAddRow={this.handleAddRow}
                        onDeleteRow={this.handleDeleteRow}
                        onEditRow={this.handleEditRow}
                        onSaveRow={this.handleSaveRow}
                        onCancelRow={this.handleCancelRow}
                        onRefresh={this.handleRefresh}
                    />
                )}
            </div>
        );
    }
}
