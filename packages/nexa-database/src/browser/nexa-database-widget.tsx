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
import { NexaDatabaseData } from '../components/nexa-database-data';

import { Mode, ActiveTab, ColumnData, RowData } from '../common/nexa-database-types';

@injectable()
export class NexaDatabaseWidget extends ReactWidget {
    static readonly ID = 'nexaDatabaseWidget';
    static readonly LABEL = 'Nexa Database Widget';

    private mode: Mode = 'NEW';
    private activeTab: ActiveTab = 'COLUMN';
    private columns: ColumnData[] = [];
    private rows: RowData[] = [];

    setMode = (mode: Mode): void => {
        this.mode = mode;
        this.update();
    };

    setActiveTab = (activeTab: ActiveTab): void => {
        this.activeTab = activeTab;
        this.update();
    };

    handleAddColumn = (): void => {
        const newColumn: ColumnData = {
            name: 'new_column',
            preset: 'uuid',
            primaryKey: false,
            notNull: false,
            unique: false
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

    handleAddRow = (): void => {
        const emptyValues: Record<string, string> = {};
        for (const column of this.columns) {
            emptyValues[column.name] = '';
        }

        const newRow: RowData = {
            values: emptyValues
        };

        this.rows = [...this.rows, newRow];
        this.update();
    };

    handleDeleteRow = (index: number): void => {
        this.rows = this.rows.filter((_, i) => i !== index);
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
                <NexaDatabaseHeader mode={this.mode} onChangeMode={mode => this.setMode(mode)} />
                <NexaDatabaseTabbar activeTab={this.activeTab} onChangeActiveTab={activeTab => this.setActiveTab(activeTab)} />
                {this.activeTab === 'COLUMN' ? (
                    <NexaDatabaseColumn
                        columns={this.columns}
                        onAddColumn={this.handleAddColumn}
                        onUpdateColumn={this.handleUpdateColumn}
                        onDeleteColumn={this.handleDeleteColumn}
                    />
                ) : (
                    <NexaDatabaseData
                        columns={this.columns}
                        rows={this.rows}
                        onAddRow={this.handleAddRow}
                        onDeleteRow={this.handleDeleteRow}
                    />
                )}
            </div>
        );
    }
}
