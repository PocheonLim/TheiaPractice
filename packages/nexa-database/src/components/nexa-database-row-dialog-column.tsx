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
import { ColumnData } from '../common/nexa-database-types';

export interface NexaDatabaseRowDialogColumnProps {
    csvColumn: ColumnData;
    tableColumns: ColumnData[];
    selectedTableColumn: string | undefined;
    previewData: string;
    onMappingChange: (csvColumnName: string, tableColumnName: string | undefined) => void;
}

export const NexaDatabaseRowDialogColumn: React.FC<NexaDatabaseRowDialogColumnProps> = ({
    csvColumn,
    tableColumns,
    selectedTableColumn,
    previewData,
    onMappingChange
}: NexaDatabaseRowDialogColumnProps) => {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = e.target.value;
        onMappingChange(csvColumn.name, value || undefined);
    };

    const isMatched = !!selectedTableColumn;

    return (
        <div className='nexa-database-row-dialog-column'>
            <div className='nexa-database-row-dialog-csv-column'>
                <div>{csvColumn.name}</div>
                <div>→</div>
            </div>
            <div className='nexa-database-row-dialog-column-table'>
                <select value={selectedTableColumn} onChange={handleSelectChange}>
                    <option value=''>-- Skip --</option>
                    {tableColumns.map(col => (
                        <option value={col.name}>
                            {col.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className='nexa-database-row-dialog-column-status'>
                {isMatched ? (
                    <span className="status-matched">✅ Matched</span>
                ) : (
                    <span className="status-skipped">⚠️ Skipped</span>
                )}
            </div>
            <div className='row-preview'>{previewData}</div>
        </div>
    );
};
