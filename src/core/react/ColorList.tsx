/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import classNames from 'classnames';
import { Color, ColorPalette } from '@app/core/utils';

interface ColorListProps {
    // The selected color.
    color?: Color;

    // The color palette.
    colors: ColorPalette;

    // True, when a color is clicked.
    onClick: (color: Color) => void;
}

export const ColorList = (props: ColorListProps) => {
    const {
        color,
        colors,
        onClick,
    } = props;

    return (
        <div className='color-picker-colors'>
            {colors.colors.map(c =>
                <div className={classNames('color-picker-color', { selected: color && c.eq(color) })} key={c.toString()}>
                    <div className='color-picker-color-inner' onClick={() => onClick(c)} style={{ background: c.toString() }}></div>
                </div>,
            )}
        </div>
    );
};
