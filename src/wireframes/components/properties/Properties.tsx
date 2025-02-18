/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Collapse } from 'antd';
import { CollapseProps } from 'antd/lib';
import classNames from 'classnames';
import { texts } from '@app/texts';
import { getDiagram, getSelection, useStore } from '@app/wireframes/model';
import { Colors } from './Colors';
import { CustomProperties } from './CustomProperties';
import { DiagramProperties } from './DiagramProperties';
import { Experimental } from './Experimental';
import { LayoutProperties } from './LayoutProperties';
import { MoreProperties } from './MoreProperties';
import { TransformProperties } from './TransformProperties';
import { VisualProperties } from './VisualProperties';

const layoutItems: CollapseProps['items'] = [
    {
        key: 'layout',
        label: texts.common.layout,
        children: (
            <>
                <LayoutProperties />

                <TransformProperties />
            </>
        ),
    },
    {
        key: 'visual',
        label: texts.common.visual,
        children: <VisualProperties />,
    },
    {
        key: 'more',
        label: texts.common.more,
        children: <MoreProperties />,
    },
    {
        key: 'custom',
        label: texts.common.custom,
        children: <CustomProperties />,
    },
];

const diagramItems: CollapseProps['items'] = [
    {
        key: 'diagram',
        label: texts.common.diagram,
        children: <DiagramProperties />,
    },
    {
        key: 'colors',
        label: texts.common.colors,
        children: <Colors />,
    },
    {
        key: 'experimental',
        label: texts.common.experimental,
        children: <Experimental />,
    },
];

export const Properties = () => {
    const hasSelection = useStore(getSelection).selectedItems.length > 0;
    const hasDiagram = !!useStore(getDiagram);

    return (
        <>
            <Collapse className={(classNames({ hidden: !hasSelection }))} items={layoutItems}
                bordered={false} defaultActiveKey={['layout', 'visual', 'more', 'custom']} />

            <Collapse className={(classNames({ hidden: hasSelection || !hasDiagram }))} items={diagramItems}
                bordered={false} defaultActiveKey={['diagram', 'colors']} />
        </>
    );
};