/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Rect2, sizeInPx, Subscription, Vec2 } from '@app/core';
import { ActionButton, useAlignment } from '@app/wireframes/components/actions';
import { Diagram, DiagramItemSet } from '@app/wireframes/model';
import { PreviewEvent } from './preview';
import './QuickbarAdorner.scss';

export interface QuickbarAdornerProps {
    // The current zoom value.
    zoom: number;

    // The size of the view.
    viewSize: Vec2;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectionSet: DiagramItemSet;

    // The preview subscription.
    previewStream: Subscription<PreviewEvent>;
}

export const QuickbarAdorner = (props: QuickbarAdornerProps) => {
    const {
        previewStream,
        selectedDiagram,
        selectionSet,
        zoom,
    } = props;

    const forAlignment = useAlignment();
    const toolbarRoot = React.useRef<HTMLDivElement>(null);
    const toolbarTimer = React.useRef<any>();
    const [selectionRect, setSelectionRect] = React.useState<Rect2>();

    React.useEffect(() => {
        // Use a stream of preview updates to bypass react for performance reasons.
        previewStream.subscribe(event => {
            const toolbar = toolbarRoot.current;

            if (!toolbar) {
                return;
            }
    
            clearTimeout(toolbarTimer.current);

            if (event.type === 'End') {
                toolbarTimer.current = setTimeout(() => {
                    toolbar.style.display = 'block';
                }, 500);
            } else if (event.type === 'Start') {
                toolbar.style.display = 'none';
            }
        });
    }, [previewStream]);

    React.useEffect(() => {
        if (selectionSet.selectedItems.length >= 2) {
            setSelectionRect(Rect2.fromRects(selectionSet.selectedItems.map(x => x.bounds(selectedDiagram).aabb)));
        } else {
            setSelectionRect(undefined);
        }
    }, [selectedDiagram, selectionSet.selectedItems]);

    if (!selectionRect) {
        return null;
    }

    const x = sizeInPx(Math.round(zoom * Math.max(0, selectionRect.x)));
    const y = sizeInPx(Math.round(zoom * selectionRect.y - 100));

    return (
        <div ref={toolbarRoot}>
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
        </div>
    );
};
