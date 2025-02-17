/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Checkbox, Col, Row } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import * as React from 'react';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { toggleWebGL, useStore } from '@app/wireframes/model';

export const Experimental = () => {
    const dispatch = useAppDispatch();
    const useWebGL = useStore(x => x.ui.useWebGL);

    const doChangeWebGL = React.useCallback((event: CheckboxChangeEvent) => {
        dispatch(toggleWebGL(event.target.checked));
    }, [dispatch]);

    return (
        <>
            <Row className='property'>
                <div>{texts.common.webGLHints1}</div>
                <div>{texts.common.webGLHints2}</div>
            </Row>

            <Row className='property'>
                <Col span={6} className='property-label'>{texts.common.webGL}</Col>
                <Col span={18} className='property-value'>
                    <Checkbox checked={useWebGL}
                        onChange={doChangeWebGL} />
                </Col>
            </Row>
        </>
    );
};