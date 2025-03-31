/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Col, Row, Select } from 'antd';
import * as React from 'react';
import { texts } from '@app/texts';
import { DefaultAppearance, getPageLink, getPageLinkId, isPageLink } from '@app/wireframes/interface';
import { getDiagramId, getPageName, getSelection, useStore } from '@app/wireframes/model';
import { useAppearance } from './../actions';
import { Text } from './Text';

export const MoreProperties = React.memo(() => {
    const diagramsMap = useStore(x => x.editor.present.diagrams);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);
    const selectedDiagramId = useStore(getDiagramId);
    const selectionSet = useStore(getSelection);

    const [link, setLink] =
        useAppearance<string | undefined>(selectedDiagramId, selectionSet,
            DefaultAppearance.LINK, true, true);

    const linkType = React.useMemo(() => {
        if (isPageLink(link.value)) {
            const pageId = getPageLinkId(link.value!);

            return { isPageLink: true, validPage: !!diagramsMap.get(pageId) };
        } else {
            return { isPageLink: false, validPage: false };
        }
    }, [diagramsMap, link.value]);

    return (
        <>
            <div style={{ display: (selectionSet.selectedItems.length > 0 ? 'block' : 'none') }}>
                <div className='property-subsection visual-properties'>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.link}</Col>
                        <Col span={12} className='property-value'>
                            <Text disabled={link.empty} text={!linkType.isPageLink ? link.value : ''} selection={selectionSet.selectedItems} onTextChange={setLink} />
                        </Col>
                    </Row>

                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.page}</Col>
                        <Col span={12} className='property-value'>
                            <Select disabled={link.empty} value={linkType.isPageLink && linkType.validPage ? link.value : ''} onChange={setLink}>
                                <Select.Option value='undefined'><></></Select.Option>

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