/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Col, InputNumber, Row } from 'antd';
import * as React from 'react';
import { Color, ColorPicker, useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { changeColor, changeSize, getColors, getEditor, useStore } from '@app/wireframes/model';

export const DiagramProperties = React.memo(() => {
    const dispatch = useAppDispatch();
    const editor = useStore(getEditor);
    const editorSize = editor.size;
    const editorColor = editor.color;
    const recentColors = useStore(getColors);
    const [color, setColor] = React.useState(Color.WHITE);
    const [sizeWidth, setWidth] = React.useState(0);
    const [sizeHeight, setHeight] = React.useState(0);

    React.useEffect(() => {
        setWidth(editorSize.x);
        setHeight(editorSize.y);
    }, [editorSize]);

    React.useEffect(() => {
        setColor(editorColor);
    }, [editorColor]);

    const doChangeSize = useEventCallback(() => {
        dispatch(changeSize(sizeWidth, sizeHeight));
    });

    const doChangeColor = useEventCallback((color: Color) => {
        dispatch(changeColor(color));
    });

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
                    <ColorPicker value={color} onChange={doChangeColor} recentColors={recentColors} />
                </Col>
            </Row>
        </>
    );
});
