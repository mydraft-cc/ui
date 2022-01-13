/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { texts } from '@app/texts';
import { DefaultAppearance, getPageLink, isPageLink } from '@app/wireframes/interface';
import { getDiagramId, getPageName, getSelectedItems, getSelectionSet, useStore } from '@app/wireframes/model';
import { Col, Row, Select } from 'antd';
import * as React from 'react';
import { useAppearance } from './../actions';
import { Text } from './Text';

export const MoreProperties = React.memo(() => {
    const selectionSet = useStore(getSelectionSet);
    const selectedDiagramId = useStore(getDiagramId);
    const selectedItems = useStore(getSelectedItems);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);

    const [link, setLink] =
        useAppearance<string | undefined>(selectedDiagramId, selectionSet,
            DefaultAppearance.LINK, true, true);

    if (!selectedDiagramId) {
        return null;
    }

    const isPageLinkCurrent = isPageLink(link.value);

    return (
        <>
            <div style={{ display: (selectedItems.length > 0 ? 'block' : 'none') }}>
                <div className='property-subsection visual-properties'>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.link}</Col>
                        <Col span={12} className='property-value'>
                            <Text disabled={link.empty} text={!isPageLinkCurrent ? link.value : ''} onTextChange={setLink} />
                        </Col>
                    </Row>

                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.page}</Col>
                        <Col span={12} className='property-value'>
                            <Select disabled={link.empty} value={isPageLinkCurrent ? link.value : ''} onChange={setLink}>
                                {diagramsOrdered.map((x, index) => 
                                    <Select.Option value={getPageLink(x.id)}>{getPageName(x, index)}</Select.Option>,
                                )}
                            </Select>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
});