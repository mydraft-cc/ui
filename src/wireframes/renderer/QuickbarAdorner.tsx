/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, sizeInPx, Vec2 } from '@app/core';
import { Diagram, DiagramItem } from '@app/wireframes/model';
import * as React from 'react';
import { ActionButton, useAlignment } from '@app/wireframes/components/actions';
import './QuickbarAdorner.scss';

export interface QuickbarAdornerProps {
    // The current zoom value.
    zoom: number;

    // The size of the view.
    viewSize: Vec2;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // True when another change is running.
    isPreviewing: boolean;
}

export const QuickbarAdorner = (props: QuickbarAdornerProps) => {
    const { isPreviewing, selectedItems, zoom } = props;

    const forAlignment = useAlignment();
    const [selectionRect, setSelectionRect] = React.useState<Rect2>();
    const [selectionLock, setSelectionLock] = React.useState(false);

    React.useEffect(() => {
        let timer: any;

        if (isPreviewing) {
            setSelectionLock(true);
        } else {
            timer = setTimeout(() => {
                setSelectionLock(false);
            }, 500);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isPreviewing]);

    React.useEffect(() => {
        setSelectionLock(false);

        if (selectedItems.length >= 2) {
            setSelectionRect(Rect2.fromRects(selectedItems.map(x => x.transform.aabb)));
        } else {
            setSelectionRect(undefined);
        }
    }, [selectedItems]);

    if (!selectionRect || selectionLock) {
        return null;
    }

    const x = sizeInPx(Math.round(zoom * Math.max(0, selectionRect.x)));
    const y = sizeInPx(Math.round(zoom * selectionRect.y - 100));

    return (
        <div className='quickbar' style={{ left: x, top: y }}>
            <ActionButton action={forAlignment.alignHorizontalLeft} />
            <ActionButton action={forAlignment.alignHorizontalCenter} />
            <ActionButton action={forAlignment.alignHorizontalRight} />
            <ActionButton action={forAlignment.alignVerticalTop} />
            <ActionButton action={forAlignment.alignVerticalCenter} />
            <ActionButton action={forAlignment.alignVerticalBottom} />
            <ActionButton action={forAlignment.distributeHorizontally} hideWhenDisabled />
            <ActionButton action={forAlignment.distributeVertically} hideWhenDisabled />
        </div>
    );
};
