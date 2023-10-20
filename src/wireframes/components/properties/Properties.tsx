/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Collapse } from 'antd';
import classNames from 'classnames';
import { texts } from '@app/texts';
import { getDiagram, getSelectedItems, useStore } from '@app/wireframes/model';
import { Colors } from './Colors';
import { CustomProperties } from './CustomProperties';
import { DiagramProperties } from './DiagramProperties';
import { LayoutProperties } from './LayoutProperties';
import { MoreProperties } from './MoreProperties';
import { TransformProperties } from './TransformProperties';
import { VisualProperties } from './VisualProperties';

export const Properties = () => {
    const hasSelection = useStore(getSelectedItems).length > 0;
    const hasDiagram = !!useStore(getDiagram);

    return (
        <>
            <Collapse className={(classNames({ hidden: !hasSelection }))} bordered={false} defaultActiveKey={['layout', 'visual', 'more', 'custom']}>
                <Collapse.Panel key='layout' header={texts.common.layout}>
                    <LayoutProperties />

                    <TransformProperties />
                </Collapse.Panel>
                <Collapse.Panel key='visual' header={texts.common.visual}>
                    <VisualProperties />
                </Collapse.Panel>
                <Collapse.Panel key='more' header={texts.common.more}>
                    <MoreProperties />
                </Collapse.Panel>
                <Collapse.Panel key='custom' header={texts.common.custom}>
                    <CustomProperties />
                </Collapse.Panel>
            </Collapse>

            <Collapse className={(classNames({ hidden: hasSelection || !hasDiagram }))} bordered={false} defaultActiveKey={['diagram', 'colors']}>
                <Collapse.Panel key='diagram' header={texts.common.diagram}>
                    <DiagramProperties />
                </Collapse.Panel>
                <Collapse.Panel key='colors' header={texts.common.colors}>
                    <Colors />
                </Collapse.Panel>
            </Collapse>
        </>
    );
};