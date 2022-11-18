/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Col, Row, Select } from 'antd';
import * as React from 'react';
import { texts } from '@app/texts';
import { DefaultAppearance, getPageLink, isPageLink } from '@app/wireframes/interface';
import { getDiagramId, getPageName, getSelectedItems, getSelectionSet, useStore } from '@app/wireframes/model';
import { useAppearance } from './../actions';
import { Text } from './Text';

export const MoreProperties = React.memo(() => {
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);
    const selectedDiagramId = useStore(getDiagramId);
    const selectedItems = useStore(getSelectedItems);
    const selectedSet = useStore(getSelectionSet);

    const [link, setLink] =
        useAppearance<string | undefined>(selectedDiagramId, selectedSet,
            DefaultAppearance.LINK, true, true);

    const isPageLinkCurrent = isPageLink(link.value);

    return (
        <>
            <div style={{ display: (selectedItems.length > 0 ? 'block' : 'none') }}>
                <div className='property-subsection visual-properties'>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.link}</Col>
                        <Col span={12} className='property-value'>
                            <Text disabled={link.empty} text={!isPageLinkCurrent ? link.value : ''} selection={selectedSet} onTextChange={setLink} />
                        </Col>
                    </Row>

                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.page}</Col>
                        <Col span={12} className='property-value'>
                            <Select disabled={link.empty} value={isPageLinkCurrent ? link.value : ''} onChange={setLink}>
                                {diagramsOrdered.map((x, index) => 
                                    <Select.Option key={x.id} value={getPageLink(x.id)}>{getPageName(x, index)}</Select.Option>,
                                )}
                            </Select>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
});