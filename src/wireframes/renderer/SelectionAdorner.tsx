/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { isModKey, Rect2, Subscription, SVGHelper, Vec2 } from '@app/core';
import { calculateSelection, Diagram, DiagramItem, DiagramItemSet } from '@app/wireframes/model';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';
import { PreviewEvent } from './preview';

const SELECTION_STROKE_COLOR = '#080';
const SELECTION_STROKE_LOCK_COLOR = '#f00';

export interface SelectionAdornerProps {
    // The current zoom value.
    zoom: number;

    // The adorner scope.
    adorners: svg.Container;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectionSet: DiagramItemSet;

    // The interaction service.
    interactionService: InteractionService;

    // The preview subscription.
    previewStream: Subscription<PreviewEvent>;

    // A function to select a set of items.
    onSelectItems: (diagram: Diagram, itemIds: ReadonlyArray<string>) => any;
}

export class SelectionAdorner extends React.Component<SelectionAdornerProps> implements InteractionHandler {
    private selectionMarkers: svg.Rect[] = [];
    private selectionShape!: svg.Rect;
    private dragStart: Vec2 | null = null;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

        // Use a stream of preview updates to bypass react for performance reasons.
        this.props.previewStream.subscribe(event => {
            if (event.type === 'Update') {
                this.markItems({});
            } else {
                this.markItems();
            }
        });

        this.selectionShape =
            this.props.adorners.rect(1, 1)
                .stroke({ color: '#0a0', width: 1 })
                .scale(1, 1)
                .fill('#00aa0044')
                .hide();
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);

        this.selectionMarkers = [];
    }

    public componentDidUpdate() {
        this.markItems();
    }

    public onMouseDown(event: SvgEvent) {
        if (!event.event.shiftKey) {
            const selection = this.selectSingle(event, this.props.selectedDiagram);

            this.props.onSelectItems(this.props.selectedDiagram, selection);
        }

        if (!event.element) {
            this.dragStart = event.position;
        }
    }

    public onMouseDrag(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (!this.dragStart) {
            next(event);
            return;
        }

        const rect = Rect2.fromVecs([this.dragStart, event.position]);

        this.transformShape(this.selectionShape, new Vec2(rect.x, rect.y), new Vec2(rect.w, rect.h), 0);
                    
        // Use the inverted zoom level as stroke width to have a constant stroke style.
        this.selectionShape.stroke({ width: 1 / this.props.zoom });
    }

    public onMouseUp(event: SvgEvent, next: (event: SvgEvent) => void) {
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

    private selectSingle(event: SvgEvent, diagram: Diagram): ReadonlyArray<string> {
        const isMod = isModKey(event.event);

        if (isMod) {
            event.event.preventDefault();
        }

        if (event.shape) {
            return calculateSelection([event.shape], diagram, true, isMod);
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
            const marker = this.props.adorners.rect(1, 1).fill('none');

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
            marker.stroke({ color, width: strokeWidth });
            
            const actualItem = item;
            const actualBounds = actualItem.bounds(this.props.selectedDiagram);

            // Also adjust the bounds by the border width, to show the border outside of the shape.
            this.transformShape(marker, actualBounds.position.sub(actualBounds.halfSize), actualBounds.size, strokeWidth, actualBounds.rotation.degree);
        });
    }

    protected transformShape(shape: svg.Rect, position: Vec2, size: Vec2, offset: number, rotation = 0) {
        // We have to disable the adjustment mode to turn off the rounding.
        SVGHelper.transformBy(shape, {
            x: position.x - 0.5 * offset,
            y: position.y - 0.5 * offset,
            w: size.x + offset,
            h: size.y + offset,
            rotation,
        }, false);

        if (size.x > 2 && size.y > 2) {
            shape.show();
        }
    }

    public render(): any {
        return null;
    }
}
