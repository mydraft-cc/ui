/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Color, ColorPicker } from '@app/core';
import { useAppDispatch } from '@app/store';
import { changeDiagramColors, getColors, useStore } from '@app/wireframes/model';

export const Colors = () => {
    const dispatch = useAppDispatch();
    const recentColors = useStore(getColors);

    const doChangeColor = React.useCallback((oldColor: Color, newColor: Color) => {
        dispatch(changeDiagramColors(oldColor, newColor));
    }, [dispatch]);

    return (
        <div>
            {recentColors.colors.map(c =>
                <span key={c.toString()} className='mr-2 mb-2'>
                    <ColorPicker value={c} onChange={color => doChangeColor(c, color)} />
                </span>
            )}
        </div>
    );
};