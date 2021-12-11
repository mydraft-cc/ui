/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance } from '@app/wireframes/interface';
import { getDiagramId, getSelectedItems, getSelectionSet, useStore } from '@app/wireframes/model';
import { Col, Row } from 'antd';
import * as React from 'react';
import { useAppearance } from './hooks';
import { Text } from './Text';

export const MoreProperties = React.memo(() => {
    const selectionSet = useStore(getSelectionSet);
    const selectedDiagramId = useStore(getDiagramId);
    const selectedItems = useStore(getSelectedItems);

    const [link, setLink] =
        useAppearance<string>(selectedDiagramId, selectionSet,
            DefaultAppearance.LINK);

    if (!selectedDiagramId) {
        return null;
    }

    return (
        <>
            <div style={{ display: (selectedItems.length > 0 ? 'block' : 'none') }}>
                <div className='property-subsection visual-properties'>
                    <Row className='property'>
                        <Col span={12} className='property-label'>Link</Col>
                        <Col span={12} className='property-value'>
                            <Text disabled={link.empty} text={link.value} onTextChange={setLink} />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
});
