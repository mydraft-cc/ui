/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Col, InputNumber, Row } from 'antd';
import * as React from 'react';
import { Color, ColorPicker, useEventCallback } from '@app/core';
import { useAppDispatch, useAppSelector } from '@app/store';
import { texts } from '@app/texts';
import { changeColor, changeSize, getColors, getEditor, useStore } from '@app/wireframes/model';
import { selectEffectiveTheme } from '@app/wireframes/model/selectors/themeSelectors';
import { DesignThemeSelector } from '../DesignThemeSelector';

// Define default theme colors as Color objects
const LIGHT_DEFAULT_COLOR = Color.WHITE;
const DARK_DEFAULT_COLOR = new Color(37 / 255, 37 / 255, 37 / 255);

export const DiagramProperties = React.memo(() => {
    const dispatch = useAppDispatch();
    const editor = useStore(getEditor);
    const editorSize = editor.size;
    const editorColor = editor.color; // User-defined color from store (might be undefined)
    const recentColors = useStore(getColors);
    const [sizeWidth, setWidth] = React.useState(0);
    const [sizeHeight, setHeight] = React.useState(0);

    // Get the effective theme to determine the default display color
    const effectiveTheme = useAppSelector(selectEffectiveTheme);
    const isDarkMode = effectiveTheme === 'dark';

    React.useEffect(() => {
        setWidth(editorSize.x);
        setHeight(editorSize.y);
    }, [editorSize]);

    const doChangeSize = useEventCallback(() => {
        dispatch(changeSize(sizeWidth, sizeHeight));
    });

    const doChangeColor = useEventCallback((color: Color) => {
        dispatch(changeColor(color));
    });

    // Determine the color to display in the picker:
    // Use the user-defined color if set, otherwise use the theme default.
    const displayColor = editorColor ? editorColor : (isDarkMode ? DARK_DEFAULT_COLOR : LIGHT_DEFAULT_COLOR);

    return (
        <>
            <Row className='property'>
                <Col span={12} className='property-label'>{texts.common.width}</Col>
                <Col span={12} className='property-value'>
                    <InputNumber value={sizeWidth} min={100} max={3000} onChange={setWidth as any} onBlur={doChangeSize} />
                </Col>
            </Row>

            <Row className='property'>
                <Col span={12} className='property-label'>{texts.common.height}</Col>
                <Col span={12} className='property-value'>
                    <InputNumber value={sizeHeight} min={100} max={3000} onChange={setHeight as any} onBlur={doChangeSize} />
                </Col>
            </Row>

            <Row className='property'>
                <Col span={12} className='property-label'>{texts.common.backgroundColor}</Col>
                <Col span={12} className='property-value'>
                    <ColorPicker value={displayColor} onChange={doChangeColor} recentColors={recentColors} />
                </Col>
            </Row>

            <Row className='property'>
                <Col span={12} className='property-label'>{texts.common.designTheme}</Col>
                <Col span={12} className='property-value'>
                    <DesignThemeSelector />
                </Col>
            </Row>
        </>
    );
});
