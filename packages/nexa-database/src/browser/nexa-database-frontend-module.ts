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

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { NexaDatabaseContribution } from './nexa-database-contribution';
import { bindViewContribution, WidgetFactory } from '@theia/core/lib/browser';
import { NexaDatabaseWidget } from './nexa-database-widget';

import '../../src/browser/style/header.css';
import '../../src/browser/style/tabbar.css';
import '../../src/browser/style/column.css';
import '../../src/browser/style/widget.css';
import '../../src/browser/style/columnItem.css';
import '../../src/browser/style/row.css';
import '../../src/browser/style/rowItem.css';
import '../../src/browser/style/mapping.css';
import '../../src/browser/style/dialogColumn.css';
import '../../src/browser/style/detail.css';

export default new ContainerModule((bind: interfaces.Bind) => {
    bindViewContribution(bind, NexaDatabaseContribution);
    bind(NexaDatabaseWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: NexaDatabaseWidget.ID,
        createWidget: () => ctx.container.get<NexaDatabaseWidget>(NexaDatabaseWidget)
    }));
});
