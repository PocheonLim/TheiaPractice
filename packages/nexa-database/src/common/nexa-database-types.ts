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

export type Mode = 'NEW' | 'EDIT';

export type ActiveTab = 'COLUMN' | 'DATA';

export type PresetKey =
    | 'uuid'
    | 'auto_increment_id'
    | 'created_time'
    | 'text'
    | 'checkbox'
    | 'number'
    | 'json'
    | 'date'
    | 'datetime'
    | 'foreign_key'
    | 'custom';

export interface ColumnData {
    name: string;
    preset?: PresetKey;
    primaryKey?: boolean;
    nullable?: boolean;
    unique?: boolean;
    isEditing?: boolean;
    type?: string;
}

export interface RowData {
    values: Record<string, string>;
    isEditing?: boolean;
}
