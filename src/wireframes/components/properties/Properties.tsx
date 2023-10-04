/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Collapse, PageHeader} from 'antd';
import classNames from 'classnames';
import * as React from 'react';
import { texts } from '@app/texts';
import { getDiagram, getSelectedItems, useStore } from '@app/wireframes/model';
import { Colors } from './Colors';
import { CustomProperties } from './CustomProperties';
import { DiagramProperties } from './DiagramProperties';
import { LayoutProperties } from './LayoutProperties';
import { MoreProperties } from './MoreProperties';
import { TransformProperties } from './TransformProperties';
import { VisualProperties } from './VisualProperties';
// import { Header } from 'antd/lib/layout/layout';

export const Properties = () => {
    const selectedItems = useStore(getSelectedItems);
    const selectedItem = useStore(getDiagram);
    const hasSelection = selectedItems.length > 0;
    const hasDiagram = !!selectedItem;
    const multipleSelection = selectedItems.length > 1;

    return (
        <>
                    <PageHeader className={(classNames({ hidden: !hasSelection}))} >
                        {(hasSelection)? (multipleSelection? 'Group': ((selectedItems.at(0)?.name != undefined)? selectedItems.at(0)?.name : selectedItems.at(0)?.renderer+ " " + selectedItems.at(0)?.id.slice(10, 14)) ) : ''}
                </PageHeader>
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