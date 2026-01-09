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
import { ActiveTab } from '../common/nexa-database-types';

export interface NexaDatabaseTabbarProps {
    activeTab: ActiveTab
    onChangeActiveTab: (activeTab: ActiveTab) => void;
}

export const NexaDatabaseTabbar: React.FC<NexaDatabaseTabbarProps> = ({ activeTab, onChangeActiveTab }: NexaDatabaseTabbarProps) => (
    <div className='nexa-database-tabbar'>
        <button onClick={() => onChangeActiveTab('COLUMN')}>Column</button>
        <button onClick={() => onChangeActiveTab('DATA')}>Data</button>
    </div>
);
