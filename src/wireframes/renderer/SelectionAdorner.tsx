/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, SVGHelper, Vec2 } from '@app/core';
import { calculateSelection, Diagram, DiagramItem } from '@app/wireframes/model';
import * as React from 'react';
import * as svg from '@svgdotjs/svg.js';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';

const SELECTION_STROKE_COLOR = '#080';
const SELECTION_STROKE_LOCK_COLOR = '#f00';

export interface SelectionAdornerProps {
    // The adorner scope.
    adorners: svg.Container;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    // A function to select a set of items.
    onSelectItems: (diagram: Diagram, itemIds: string[]) => any;
}

export class SelectionAdorner extends React.Component<SelectionAdornerProps> implements InteractionHandler {
    private selectionMarkers: any[] = [];
    private selectionShape: any;
    private dragStart: Vec2 | null;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

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

        if (rect.area > 0) {
            this.transformShape(this.selectionShape, new Vec2(rect.x, rect.y), new Vec2(rect.w, rect.h), 0);
        } else {
            this.selectionShape.hide();
        }
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
            this.selectionShape.hide();

            this.dragStart = null;
        }
    }

    private selectMultiple(rect: Rect2, diagram: Diagram): string[] {
        const selectedItems = diagram.rootItems.filter(i => rect.contains(i.bounds(diagram).aabb));

        return calculateSelection(selectedItems, diagram, false);
    }

    private selectSingle(event: SvgEvent, diagram: Diagram): string[] {
        const aabb = event.shape?.bounds(diagram).aabb;

        if (aabb?.contains(event.position) && event.shape) {
            return calculateSelection([event.shape], diagram, true, event.event.ctrlKey);
        } else {
            return [];
        }
    }

    private markItems() {
        for (const adorner of this.selectionMarkers) {
            adorner.hide();
        }

        const selection = this.props.selectedItems;

        while (this.selectionMarkers.length < selection.length) {
            const marker = this.props.adorners.rect(1, 1).fill('none').stroke({ width: 1 });

            this.selectionMarkers.push(marker);
        }

        this.props.selectedItems.forEach((item, i) => {
            const marker = this.selectionMarkers[i];

            const color =
                item.isLocked ?
                    SELECTION_STROKE_LOCK_COLOR :
                    SELECTION_STROKE_COLOR;
            marker.stroke({ color });

            const bounds = item.bounds(this.props.selectedDiagram);

            this.transformShape(marker, bounds.position.sub(bounds.halfSize), bounds.size, 1, bounds.rotation.degree);
        });
    }

    protected transformShape(shape: svg.Element, position: Vec2, size: Vec2, offset: number, rotation = 0) {
        SVGHelper.transform(shape, {
            x: position.x - offset,
            y: position.y - offset,
            w: size.x + 2 * offset,
            h: size.y + 2 * offset,
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
