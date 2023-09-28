/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { getDiagramId, useStore } from '@app/wireframes/model';
import { ActionButton, useAlignment } from './../actions';
import './LayoutProperties.scss';

export const LayoutProperties = React.memo(() => {
    const forAlignment = useAlignment();
    const selectedDiagramId = useStore(getDiagramId);

    if (!selectedDiagramId) {
        return null;
    }

    return (
        <>
            <div className='properties-subsection layout-properties'>
                <ActionButton action={forAlignment.alignHorizontalLeft} />
                <ActionButton action={forAlignment.alignHorizontalCenter} />
                <ActionButton action={forAlignment.alignHorizontalRight} />

                <ActionButton action={forAlignment.alignVerticalTop} />
                <ActionButton action={forAlignment.alignVerticalCenter} />
                <ActionButton action={forAlignment.alignVerticalBottom} />

                <ActionButton action={forAlignment.distributeHorizontally} />
                <ActionButton action={forAlignment.distributeVertically} />
            </div>

            <div className='properties-subsection layout-properties'>
                <ActionButton action={forAlignment.bringToFront} />
                <ActionButton action={forAlignment.bringForwards} />
                <ActionButton action={forAlignment.sendBackwards} />
                <ActionButton action={forAlignment.sendToBack} />
            </div>
        </>
    );
});
