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

    // Alignment of the colors within the container.
    alignment?: 'center' | 'left';

    // True, when a color is clicked.
    onClick: (color: Color) => void;
}

export const ColorList = (props: ColorListProps) => {
    const {
        alignment,
        color,
        colors,
        onClick,
    } = props;

    // Default to 'center' if alignment is not provided
    const alignClass = alignment === 'left' ? 'left-aligned' : '';

    return (
        <div className={classNames('color-picker-colors', alignClass)}>
            {colors.colors.map(c =>
                <div className={classNames('color-picker-color', { selected: color && c.eq(color) })} key={c.toString()}>
                    <div className='color-picker-color-inner' onClick={() => onClick(c)} style={{ background: c.toString() }}></div>
                </div>
            )}
        </div>
    );
};
