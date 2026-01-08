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
import { Mode } from '../common/types';

export interface NexaDatabaseHeaderProps {
    mode: Mode;
    onChangeMode: (mode: Mode) => void;
}

export const NexaDatabaseHeader: React.FC<NexaDatabaseHeaderProps> = ({ mode, onChangeMode }: NexaDatabaseHeaderProps) => (
    <div className="nexa-database-header">
        <div className="nexa-database-header-menu">
            <div className="nexa-database-header-left">
                <span>{mode === 'NEW' ? 'New Table:' : 'Edit Table:'}</span>
                <input type="text" placeholder="Enter table name" />
                {mode === 'EDIT' && <button>Rename</button>}
            </div>
            <div className="nexa-database-header-center">
                {mode === 'NEW' ? (
                    <button onClick={() => onChangeMode('EDIT')}>Switch to Edit</button>
                ) : (
                    <button onClick={() => onChangeMode('NEW')}>Switch to New</button>
                )}
            </div>
            <div className="nexa-database-header-right">
                {mode === 'NEW' && (
                    <>
                        <button>Import CSV</button>
                        <button>Save CSV</button>
                    </>
                )}
            </div>
        </div>
    </div>
);
