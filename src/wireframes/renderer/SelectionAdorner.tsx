/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { isMiddleMouse, isModKey, Rect2, Subscription, Vec2 } from '@app/core';
import { Engine, EngineHitEvent, EngineLayer, EngineMouseEvent, EngineRect, Listener } from '@app/wireframes/engine';
import { calculateSelection, Diagram, DiagramItem, DiagramItemSet } from '@app/wireframes/model';
import { PreviewEvent } from './preview';

const SELECTION_STROKE_COLOR = '#080';
const SELECTION_STROKE_LOCK_COLOR = '#f00';
const SELECTOR_STROKE_COLOR = '#0a0';

export interface SelectionAdornerProps {
    // The current zoom value.
    zoom: number;

    // The target layer
    layer: EngineLayer;

    // The current engine
    engine: Engine;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectionSet: DiagramItemSet;

    // The preview subscription.
    previewStream: Subscription<PreviewEvent>;

    // A function to select a set of items.
    onSelectItems: (diagram: Diagram, itemIds: ReadonlyArray<string>) => any;
}

export class SelectionAdorner extends React.Component<SelectionAdornerProps> implements Listener {
    private selectionMarkers: EngineRect[] = [];
    private selectionShape!: EngineRect;
    private dragStart: Vec2 | null = null;

    public componentDidMount() {
        this.props.engine.subscribe(this);

        // Use a stream of preview updates to bypass react for performance reasons.
        this.props.previewStream.subscribe(event => {
            if (event.type === 'Update') {
                this.markItems({});
            } else {
                this.markItems();
            }
        });

        this.selectionShape = this.props.layer.rect();
        this.selectionShape.fill('#00aa0044');
        this.selectionShape.strokeWidth(1);
        this.selectionShape.strokeColor(SELECTOR_STROKE_COLOR);
        this.selectionShape.hide();
    }

    public componentWillUnmount() {
        this.props.engine.unsubscribe(this);

        this.selectionMarkers = [];
    }

    public componentDidUpdate() {
        this.markItems();
    }

    public onMouseDown(event: EngineHitEvent) {     
        // The middle mouse button is needed for pan and zoom.
        if (isMiddleMouse(event.source)) {
            return;
        }

        if (!event.source.shiftKey) {
            const selection = this.selectSingle(event, this.props.selectedDiagram);

            this.props.onSelectItems(this.props.selectedDiagram, selection);
        }

        if (!event.object) {
            this.dragStart = event.position;
        }
    }

    public onMouseDrag(event: EngineMouseEvent, next: (event: EngineMouseEvent) => void) {
        if (!this.dragStart) {
            next(event);
            return;
        }

        const rect = Rect2.fromVecs([this.dragStart, event.position]);

        this.transformShape(this.selectionShape, new Vec2(rect.x, rect.y), new Vec2(rect.w, rect.h), 0);
                    
        // Use the inverted zoom level as stroke width to have a constant stroke width.
        this.selectionShape.strokeWidth(1 / this.props.zoom);
    }

    public onMouseUp(event: EngineMouseEvent, next: (event: EngineMouseEvent) => void) {
        if (!this.dragStart) {
            next(event);
            return;
        }

        try {
            const rect = Rect2.fromVecs([this.dragStart, event.position]);

            if (rect.area < 100) {
                return;
            }

            const selection = this.selectMultiple(rect, this.props.selectedDiagram);

            if (selection) {
                this.props.onSelectItems(this.props.selectedDiagram, selection!);
            }
        } finally {
            this.stopDrag();
        }
    }

    public onBlur(event: FocusEvent, next: (event: FocusEvent) => void) {
        if (!this.dragStart) {
            next(event);
            return;
        }

        this.stopDrag();
    }

    private stopDrag() {
        this.selectionShape.hide();

        this.dragStart = null;
    }

    private selectMultiple(rect: Rect2, diagram: Diagram): ReadonlyArray<string> {
        const selectedItems = diagram.rootItems.filter(i => rect.contains(i.bounds(diagram).aabb));

        return calculateSelection(selectedItems, diagram, false);
    }

    private selectSingle(event: EngineHitEvent, diagram: Diagram): ReadonlyArray<string> {
        const isMod = isModKey(event.source);

        if (isMod) {
            event.source.preventDefault();
        }

        if (event.item) {
            return calculateSelection([event.item], diagram, true, isMod);
        } else {
            return [];
        }
    }

    private markItems(preview?: { [id: string]: DiagramItem }) {
        for (const adorner of this.selectionMarkers) {
            adorner.hide();
        }

        const selection = preview ? Object.values(preview) : Array.from(this.props.selectionSet.selection.values());

        // Add more markers if we do not have enough.
        while (this.selectionMarkers.length < selection.length) {
            const marker = this.props.layer.rect();

            this.selectionMarkers.push(marker);
        }

        // Use the inverted zoom level as stroke width.
        const strokeWidth = 1 / this.props.zoom;

        selection.forEach((item, i) => {
            const marker = this.selectionMarkers[i];

            const color =
                item.isLocked ?
                    SELECTION_STROKE_LOCK_COLOR :
                    SELECTION_STROKE_COLOR;
                    
            // Use the inverted zoom level as stroke width to have a constant stroke style.
            marker.strokeWidth(strokeWidth);
            marker.strokeColor(color);
            marker.fill('none');
            
            const actualItem = item;
            const actualBounds = actualItem.bounds(this.props.selectedDiagram);

            // Also adjust the bounds by the border width, to show the border outside of the shape.
            this.transformShape(marker, actualBounds.position.sub(actualBounds.halfSize), actualBounds.size, 0, actualBounds.rotation.degree);
        });
    }

    protected transformShape(shape: EngineRect, position: Vec2, size: Vec2, offset: number, rotation = 0) {
        shape.plot({
            x: position.x - 0.5 * offset,
            y: position.y - 0.5 * offset,
            w: size.x + offset,
            h: size.y + offset,
            rotation,
        });

        if (size.x > 2 && size.y > 2) {
            shape.show();
        }
    }

    public render(): any {
        return null;
    }
}
