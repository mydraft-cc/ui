import * as React from 'react';
import * as paper from 'paper';

import {
    PaperHelper,
    Rotation,
    Vec2
} from '@app/core';

import {
    Diagram,
    DiagramShape,
    DiagramItem,
    SnapManager,
    Transform
} from '@app/wireframes/model';

import { Overlays } from './overlays';

import {
    InteractionHandler,
    InteractionService
} from './interaction-service';

const MODE_RESIZE = 2;
const MODE_MOVE = 3;
const MODE_ROTATE = 1;

const TRANSFORMER_STROKE_COLOR = new paper.Color(0, 0.5, 0);
const TRANSFORMER_FILL_COLOR = new paper.Color(0, 1, 0);

export interface TransformAdornerProps {
    // The adorner scope.
    adornerScope: paper.PaperScope;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // A function to transform a set of items.
    transformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => void;

    // The interaction service.
    interactionService: InteractionService;
}

export class TransformAdorner extends React.Component<TransformAdornerProps> implements InteractionHandler {
    private currentTransform: Transform;
    private startTransform: Transform;
    private resizeShapes: paper.Item[] | null = null;
    private rotateShape: paper.Shape;
    private moveShape: paper.Shape;
    private overlays: Overlays;
    private canResizeX: boolean;
    private canResizeY: boolean;
    private lastSelection: any;
    private manipulated = false;
    private adornerLayer: paper.Layer;
    private adornerScope: paper.PaperScope;
    private rotation: Rotation;
    private resizeDragOffset: Vec2;
    private manipulationMode = 0;
    private snapManager = new SnapManager();

    public componentDidMount() {
        this.adornerScope = this.props.adornerScope;
        this.adornerScope.activate();

        this.adornerLayer = new paper.Layer();
        this.adornerLayer.activate();

        this.props.interactionService.addHandler(this);
        this.props.interactionService.addCursorLayer(this.adornerLayer);

        this.overlays = new Overlays(this.props.adornerScope, this.adornerLayer);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);
        this.props.interactionService.removeCursorLayer(this.adornerLayer);

        this.adornerLayer.removeChildren();
        this.adornerLayer.remove();
    }

    public componentDidUpdate() {
        if (this.lastSelection !== this.props.selectedDiagram.selectedItemIds) {
            this.rotation = Rotation.ZERO;
        }

        this.layoutMarkers();

        this.lastSelection = this.props.selectedDiagram.selectedItemIds;
    }

    private layoutMarkers() {
        this.adornerScope.activate();
        this.adornerLayer.activate();

        this.createRotateShape();
        this.createMoveShape();
        this.createResizeShapes();

        if (this.hasSelection()) {
            this.calculateInitializeTransform();
            this.calculateResizeRestrictions();
            this.layoutShapes();
        } else {
            this.hideShapes();
        }
    }

    private calculateInitializeTransform() {
        let transform: Transform;

        if (this.props.selectedItems.length === 1) {
            transform = this.props.selectedItems[0].bounds(this.props.selectedDiagram);
        } else {
            transform = Transform.createFromTransformationsAndRotations(this.props.selectedItems.map(x => x.bounds(this.props.selectedDiagram)), this.rotation);
        }

        this.currentTransform = transform;
    }

    private calculateResizeRestrictions() {
        this.canResizeX = false;
        this.canResizeY = false;

        for (let item of this.props.selectedItems) {
            if (item instanceof DiagramShape) {
                if (item.constraint) {
                    if (!item.constraint.calculateSizeX()) {
                        this.canResizeX = true;
                    }

                    if (!item.constraint.calculateSizeY()) {
                        this.canResizeY = true;
                    }
                    continue;
                }
            }
            this.canResizeX = true;
            this.canResizeY = true;
        }
    }

    public onMouseDown(event: paper.ToolEvent): boolean {
        if (!this.hasSelection()) {
            return true;
        }

        this.manipulated = true;

        const hitResult = this.adornerLayer.hitTest(event.point, { guides: true, fill: true, segments: true, tolerance: 2 });
        const hitItem = hitResult ? hitResult.item : null;

        if (hitItem && (hitItem === this.moveShape || hitItem === this.rotateShape || (this.resizeShapes && this.resizeShapes.indexOf(hitItem) >= 0))) {
            this.manipulated = false;

            if (hitItem === this.moveShape) {
                this.manipulationMode = MODE_MOVE;
            } else if (hitItem === this.rotateShape) {
                this.manipulationMode = MODE_ROTATE;
            } else {
                this.resizeDragOffset = hitItem['offset'];

                this.manipulationMode = MODE_RESIZE;
            }

            this.startTransform = this.currentTransform;

            return false;
        }

        this.manipulationMode = 0;

        return true;
    }

    public onMouseDrag(event: paper.ToolEvent): boolean {
        if (!this.hasSelection()) {
            return true;
        }

        this.overlays.reset();

        if (this.manipulationMode !== 0) {
            this.manipulated = true;

            if (this.manipulationMode === MODE_MOVE) {
                this.move(event);
            } else if (this.manipulationMode === MODE_ROTATE) {
                this.rotate(event);
            } else {
                this.resize(event);
            }

            this.layoutShapes();

            return false;
        }

        return true;
    }

    private move(event: paper.ToolEvent) {
        const delta = new Vec2(
            event.point.x - event.downPoint.x,
            event.point.y - event.downPoint.y);

        const snapResult =
            this.snapManager.snapMoving(this.props.selectedDiagram, this.startTransform, delta,
                this.props.interactionService.isShiftKeyPressed());

        this.currentTransform = this.startTransform.moveBy(snapResult.delta);

        this.overlays.showSnapAdorners(snapResult);
        this.overlays.showInfo(this.currentTransform, `X: ${Math.round(this.currentTransform.aabb.x)}, Y: ${Math.round(this.currentTransform.aabb.y)}`);
    }

    private rotate(event: paper.ToolEvent) {
        const delta = this.getCummulativeRotation(event);

        const deltaRotation =
            this.snapManager.snapRotating(this.startTransform, delta,
                this.props.interactionService.isShiftKeyPressed());

        this.currentTransform = this.startTransform.rotateBy(Rotation.createFromDegree(deltaRotation));

        this.overlays.showInfo(this.currentTransform, `Y: ${this.currentTransform.rotation.degree}°`);
    }

    private getCummulativeRotation(event: paper.ToolEvent): number {
        const center = this.startTransform.position;

        const eventPoint = PaperHelper.point2Vec(event.point);
        const eventStart = PaperHelper.point2Vec(event.downPoint);

        const cummulativeRotation = Vec2.angleBetween(eventStart.sub(center), eventPoint.sub(center));

        return cummulativeRotation;
    }

    private resize(event: paper.ToolEvent) {
        const cummulativeTranslation = new Vec2(
            event.point.x - event.downPoint.x,
            event.point.y - event.downPoint.y);

        const startRotation = this.startTransform.rotation;

        const deltaSize = this.getResizeDeltaSize(startRotation, cummulativeTranslation);
        const deltaPos = this.getResizeDeltaPos(startRotation, deltaSize);

        this.currentTransform = this.startTransform.resizeAndMoveBy(deltaSize, deltaPos);

        this.overlays.showInfo(this.currentTransform, `Width: ${this.currentTransform.size.x}, Height: ${this.currentTransform.size.y}`);
    }

    private getResizeDeltaSize(angle: Rotation, cummulativeTranslation: Vec2) {
        const delta = Vec2.createRotated(cummulativeTranslation.mulScalar(2), Vec2.ZERO, angle.negate()).mul(this.resizeDragOffset);

        const snapResult =
            this.snapManager.snapResizing(this.props.selectedDiagram!, this.startTransform, delta,
                this.props.interactionService.isShiftKeyPressed(),
                this.resizeDragOffset.x,
                this.resizeDragOffset.y);

        this.overlays.showSnapAdorners(snapResult);

        return snapResult.delta;
    }

    private getResizeDeltaPos(angle: Rotation, dSize: Vec2) {
        let x = 0, y = 0;

        if (this.resizeDragOffset.y !== 0) {
            y += this.resizeDragOffset.y * dSize.y * angle.cos;
            x -= this.resizeDragOffset.y * dSize.y * angle.sin;
        }

        if (this.resizeDragOffset.x !== 0) {
            y += this.resizeDragOffset.x * dSize.x * angle.sin;
            x += this.resizeDragOffset.x * dSize.x * angle.cos;
        }

        return new Vec2(x, y);
    }

    public onMouseUp(event: paper.ToolEvent): boolean {
        if (!this.hasSelection()) {
            return true;
        }

        try {
            this.overlays.reset();

            if (this.manipulationMode !== 0 && this.manipulated) {
                this.rotation = this.currentTransform.rotation;

                this.props.transformItems(
                    this.props.selectedDiagram,
                    this.props.selectedItems,
                    this.startTransform,
                    this.currentTransform);

                return false;
            }
        } finally {
            this.manipulationMode = 0;
            this.manipulated = false;
        }

        return true;
    }

    private layoutShapes() {
        if (this.resizeShapes === null) {
            return;
        }

        const size = this.currentTransform.size;

        const rotation = this.currentTransform.rotation.degree;
        const position = this.currentTransform.position;

        const anchor = new paper.Point(position);

        for (let resizeShape of this.resizeShapes) {
            const offset = resizeShape['offset'];

            resizeShape.matrix.reset();
            resizeShape.position =
                new paper.Point(
                    Math.round(position.x + offset.x * (size.x + 4)),
                    Math.round(position.y + offset.y * (size.y + 4)));
            resizeShape.rotate(rotation, anchor);
            resizeShape.visible =
                (offset.x === 0 || this.canResizeX) &&
                (offset.y === 0 || this.canResizeY);
        }

        const rotateShape = this.rotateShape;

        rotateShape.matrix.reset();
        rotateShape.position =
            new paper.Point(
                Math.round(position.x),
                Math.round(position.y - size.y * 0.5 - 20));
        rotateShape.rotate(rotation, anchor);
        rotateShape.visible = true;

        const moveShape = this.moveShape;

        moveShape.matrix.reset();
        moveShape.size = new paper.Size(size.x + 1, size.y + 1);
        moveShape.position = anchor;
        moveShape.rotate(rotation, anchor);
        moveShape.visible = true;
    }

    private hideShapes() {
        this.rotateShape.visible = this.moveShape.visible = false;

        if (this.resizeShapes === null) {
            return;
        }

        this.resizeShapes.forEach(s => s.visible = false);
    }

    private createMoveShape() {
        if (!this.moveShape) {
            const moveShape = paper.Shape.Rectangle(PaperHelper.ZERO_POINT, PaperHelper.ZERO_POINT);

            moveShape.fillColor = new paper.Color(1, 1, 1, 0.00001);
            moveShape.strokeColor = TRANSFORMER_STROKE_COLOR;
            moveShape.strokeWidth = 1;
            moveShape.strokeScaling = false;
            moveShape.visible = false;
            moveShape['guide'] = true;

            this.props.interactionService.setCursor(moveShape, 'move');

            this.moveShape = moveShape;
        }
    }

    private createRotateShape() {
        if (!this.rotateShape) {
            const rotateShape = paper.Shape.Circle(PaperHelper.ZERO_POINT, 8);

            rotateShape.fillColor = TRANSFORMER_FILL_COLOR;
            rotateShape.strokeColor = TRANSFORMER_STROKE_COLOR;
            rotateShape.strokeWidth = 1;
            rotateShape.visible = false;
            rotateShape['guide'] = true;

            this.props.interactionService.setCursor(rotateShape, 'pointer');

            this.rotateShape = rotateShape;
        }
    }

    private createResizeShapes() {
        if (!this.resizeShapes) {
            this.resizeShapes = [];

            const ys = [-0.5, -0.5, -0.5, 0.0, 0.0, 0.5, 0.5, 0.5];
            const xs = [-0.5, 0.0, 0.5, -0.5, 0.5, -0.5, 0.0, 0.5];
            const as = [315, 0, 45, 270, 90, 215, 180, 135];

            const size = new paper.Size(13, 13);

            for (let i = 0; i < xs.length; i++) {
                const resizeShape = paper.Shape.Rectangle(PaperHelper.ZERO_POINT, size);

                resizeShape.fillColor = TRANSFORMER_FILL_COLOR;
                resizeShape.strokeColor = TRANSFORMER_STROKE_COLOR;
                resizeShape.strokeWidth = 1;
                resizeShape.strokeScaling = false;
                resizeShape.visible = false;
                resizeShape['guide'] = true;
                resizeShape['offset'] = new Vec2(xs[i], ys[i]);

                this.props.interactionService.setRotationCursor(resizeShape, as[i]);

                this.resizeShapes.push(resizeShape);
            }
        }
    }

    private hasSelection(): boolean {
        return this.props.selectedItems.length > 0;
    }

    public render() {
        return null;
    }
}