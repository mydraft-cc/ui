/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, SVGHelper, Vec2 } from '@app/core';
import { calculateSelection, Diagram, DiagramItem } from '@app/wireframes/model';
import * as React from 'react';
import * as svg from 'svg.js';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';

const SELECTION_STROKE_COLOR = '#080';
const SELECTION_STROKE_LOCK_COLOR = '#f00';
const SELECTION_FILL_COLOR = 'none';

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

export class SelectionAdorner extends React.PureComponent<SelectionAdornerProps> implements InteractionHandler {
    private shapesAdorners: any[] = [];
    private selectionShape: any;
    private dragStart: Vec2 | null;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

        this.selectionShape =
            this.props.adorners.rect(1, 1)
                .stroke({ color: '#0a0', width: 1 }).opacity(0.3);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);

        this.shapesAdorners = [];
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
            const selectedRect = Rect2.fromVecs([this.dragStart, event.position]);

            if (selectedRect.area > 100) {
                const selection = this.selectMultiple(selectedRect, this.props.selectedDiagram);

                if (selection) {
                    this.props.onSelectItems(this.props.selectedDiagram, selection!);
                }
            }
        } finally {
            this.selectionShape.hide();

            this.dragStart = null;
        }
    }

    private selectMultiple(rect: Rect2, diagram: Diagram): string[] {
        const selectedItems = diagram.rootItems.filter(i => rect.contains(i.bounds(diagram).aabb));
        const selection = calculateSelection(selectedItems, diagram, false);

        return selection;
    }

    private selectSingle(event: SvgEvent, diagram: Diagram): string[] {
        if (event.shape && event.shape.bounds(diagram).aabb.contains(event.position)) {
            return calculateSelection([event.shape], diagram, true, event.event.ctrlKey);
        } else {
            return [];
        }
    }

    private markItems() {
        for (const adorner of this.shapesAdorners) {
            adorner.hide();
        }

        let i = 0;
        for (const item of this.props.selectedItems) {
            let shapeAdorner: any;

            if (i >= this.shapesAdorners.length) {
                shapeAdorner = this.props.adorners.rect(1, 1).fill(SELECTION_FILL_COLOR);

                this.shapesAdorners.push(shapeAdorner);
            } else {
                shapeAdorner = this.shapesAdorners[i];
            }

            const color =
                item.isLocked ?
                    SELECTION_STROKE_LOCK_COLOR :
                    SELECTION_STROKE_COLOR;
            shapeAdorner.stroke({ color, width: 1 });

            const bounds = item.bounds(this.props.selectedDiagram);

            this.transformShape(shapeAdorner, bounds.position, bounds.size, 1);
            i++;
        }
    }

    protected transformShape(shape: svg.Element, position: Vec2, size: Vec2, offset: number) {
        SVGHelper.transform(shape, {
            x: position.x - offset,
            y: position.y - offset,
            w: size.x + 2 * offset,
            h: size.y + 2 * offset,
        });

        shape.show();
    }

    public render(): any {
        return null;
    }
}
