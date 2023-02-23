/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Color, ColorPicker } from '@app/core';
import { changeColors, getColors, useStore } from '@app/wireframes/model';

export const Colors = () => {
    const dispatch = useDispatch();
    const recentColors = useStore(getColors);

    const doChangeColor = React.useCallback((oldColor: Color, newColor: Color) => {
        dispatch(changeColors(oldColor, newColor));
    }, [dispatch]);

    return (
        <div>
            {recentColors.colors.map(c =>
                <span key={c.toString()} className='mr-2 mb-2'>
                    <ColorPicker value={c} onChange={color => doChangeColor(c, color)} />,
                </span>,
            )}
        </div>
    );
};