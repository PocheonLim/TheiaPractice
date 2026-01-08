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
import { Mode } from '../common/types';

@injectable()
export class NexaDatabaseWidget extends ReactWidget {
    static readonly ID = 'nexaDatabaseWidget';
    static readonly LABEL = 'Nexa Database Widget';

    private mode: Mode = 'NEW';

    setMode = (mode: Mode): void => {
        this.mode = mode;
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
            <div>
                <NexaDatabaseHeader mode={this.mode} onChangeMode={mode => this.setMode(mode)} />
                <div>
                    <p>위젯 본문 내용</p>
                </div>
            </div>
        );
    }
}
