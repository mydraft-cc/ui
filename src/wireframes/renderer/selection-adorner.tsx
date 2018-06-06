import * as paper from 'paper';
import * as React from 'react';

import {
    PaperHelper,
    Rect2,
    Vec2
} from '@app/core';

import {
    calculateSelection,
    Diagram,
    DiagramItem
} from '@app/wireframes/model';

import {
    InteractionHandler,
    InteractionService
} from './interaction-service';

const SELECTION_STROKE_COLOR = new paper.Color(0, 0, 0.5);
const SELECTION_FILL_COLOR = new paper.Color(0, 0, 1);

export interface SelectionAdornerProps {
    // The adorner scope.
    adornerScope: paper.PaperScope;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    // A function to retrieve a render element by diagram item.
    provideItemByElement: (item: paper.Item) => DiagramItem | null;

    // A function to select a set of items.
    selectItems: (diagram: Diagram, itemIds: string[]) => any;
}

export class SelectionAdorner extends React.Component<SelectionAdornerProps> implements InteractionHandler {
    private adornerLayer: paper.Layer;
    private adornerScope: paper.PaperScope;
    private shapesAdorners: paper.Shape[] = [];
    private selectionShape: paper.Shape | null = null;
    private dragStart: Vec2 | null;
    private drag = false;

    public componentDidMount() {
        this.adornerScope = this.props.adornerScope;
        this.adornerScope.activate();

        this.adornerLayer = new paper.Layer();
        this.adornerLayer.activate();
        this.adornerLayer.sendToBack();

        this.props.interactionService.addHandler(this);
        this.props.interactionService.addAdornerLayer(this.adornerLayer);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);

        this.adornerLayer.removeChildren();
        this.adornerLayer.remove();

        this.shapesAdorners = [];
    }

    public componentDidUpdate() {
        this.markItems();
    }

    public onMouseDown(event: paper.ToolEvent, next: () => void) {
        if (!this.props.interactionService.isShiftKeyPressed()) {
            const selection = this.selectSingle(event, this.props.selectedDiagram);

            this.props.selectItems(this.props.selectedDiagram, selection);
        }

        if (!event.item) {
            this.drag = true;
            this.dragStart = PaperHelper.point2Vec(event.point);
        }
    }

    public onMouseDrag(event: paper.ToolEvent, next: () => void) {
        if (!this.drag) {
            return next();
        }

        const eventPoint = PaperHelper.point2Vec(event.point);
        const eventStart = PaperHelper.point2Vec(event.downPoint);

        const selectedArea = Rect2.createFromVecs([eventPoint, eventStart]);
        const selectionShape = this.getOrCreateRectangle();

        selectionShape.visible = selectedArea.size.x > 0 && selectedArea.size.y > 0;

        if (selectionShape.visible) {
            this.transformShape(selectionShape, selectedArea.position, selectedArea.size, 0);
        }
    }

    public onMouseUp(event: paper.ToolEvent, next: () =>  void) {
        if (!this.drag) {
            return next();
        }

        try {
            const selectionShape = this.getOrCreateRectangle();

            selectionShape.visible = false;

            if (this.hasMoved(event)) {
                const selection = this.selectMultiple(event, this.props.selectedDiagram);

                if (selection !== null) {
                    this.props.selectItems(this.props.selectedDiagram, selection!);
                }
            }
        } finally {
            this.drag = false;
            this.dragStart = null;
        }
    }

    private hasMoved(e: paper.ToolEvent): boolean {
        const position = PaperHelper.point2Vec(e.point);

        return !this.dragStart || position.sub(this.dragStart).lengtSquared > 10;
    }

    private selectMultiple(event: paper.ToolEvent, diagram: Diagram): string[] {
        const eventPoint = PaperHelper.point2Vec(event.point);
        const eventStart = PaperHelper.point2Vec(event.downPoint);

        const selectedArea = Rect2.createFromVecs([eventStart, eventPoint]);
        const selectedItems = diagram.rootIds.map(id => diagram.items.get(id)).filter(i => i && selectedArea.containsRect(i.bounds(diagram).aabb)).map(i => i!);

        const selection = calculateSelection(selectedItems, diagram, true);

        return selection;
    }

    private selectSingle(event: paper.ToolEvent, diagram: Diagram): string[] {
        let selection: string[] = [];

        if (event.item) {
            const selectedItem = this.props.provideItemByElement(event.item);
            const eventPoint = PaperHelper.point2Vec(event.point);

            if (selectedItem && selectedItem.bounds(diagram).aabb.containsVec(eventPoint)) {
                selection = calculateSelection([selectedItem], diagram, true, this.props.interactionService.isControlKeyPressed());
            }
        }

        return selection;
    }

    private markItems() {
        this.adornerScope.activate();
        this.adornerLayer.activate();

        for (let shapeAdorner of this.shapesAdorners) {
            shapeAdorner.visible = false;
        }

        let i = 0;
        for (let item of this.props.selectedItems) {
            let shapeAdorner: paper.Shape;

            if (i >= this.shapesAdorners.length) {
                shapeAdorner = paper.Shape.Rectangle(PaperHelper.ZERO_POINT, PaperHelper.ZERO_POINT);

                shapeAdorner.strokeColor = SELECTION_STROKE_COLOR;
                shapeAdorner.strokeWidth = 1;
                shapeAdorner.visible = false;
                shapeAdorner.sendToBack();

                this.shapesAdorners.push(shapeAdorner);
            } else {
                shapeAdorner = this.shapesAdorners[i];
            }

            const bounds = item.bounds(this.props.selectedDiagram);

            this.transformShape(shapeAdorner, bounds.position.sub(bounds.halfSize), bounds.size, 1, bounds.rotation.degree);
            i++;
        }
    }

    private getOrCreateRectangle(): paper.Shape {
        if (this.selectionShape) {
            return this.selectionShape;
        }

        this.adornerScope.activate();
        this.adornerLayer.activate();

        const selectionShape = paper.Shape.Rectangle(PaperHelper.ZERO_POINT, PaperHelper.ZERO_POINT);

        selectionShape.fillColor = SELECTION_FILL_COLOR;
        selectionShape.opacity = 0.4;
        selectionShape.strokeColor = SELECTION_STROKE_COLOR;
        selectionShape.strokeWidth = 1;
        selectionShape.visible = false;

        this.selectionShape = selectionShape;

        return selectionShape;
    }

    protected transformShape(shape: paper.Shape, position: Vec2, size: Vec2, offset: number, rotation = 0) {
        shape.matrix.reset();

        const bounds = new Rect2(position, size);
        let l = Math.round(bounds.left);
        let t = Math.round(bounds.top);
        let r = Math.round(bounds.right);
        let b = Math.round(bounds.bottom);

        l += 0.5 - offset;
        t += 0.5 - offset;
        r -= 0.5 - offset;
        b -= 0.5 - offset;

        const rect = new paper.Rectangle(l, t, r - l, b - t);

        shape.size = rect.size;
        shape.position = rect.center;
        shape.rotation = rotation;
        shape.visible = true;
    }

    public render() {
        return null;
    }
}