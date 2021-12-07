/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SVGHelper, Vec2 } from '@app/core';
import { Diagram, DiagramItem, SnapManager, Transform } from '@app/wireframes/model';
import * as React from 'react';
import * as svg from '@svgdotjs/svg.js';
import { SVGRenderer2 } from '../shapes/utils/svg-renderer2';
import { InteractionOverlays } from './interaction-overlays';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';

const MODE_RESIZE = 2;
const MODE_MOVE = 3;

const TRANSFORMER_STROKE_COLOR = '#080';
const TRANSFORMER_FILL_COLOR = '#0f0';

export interface TransformAdornerProps {
    // The current zoom value.
    zoom: number;

    // The view size of the editor.
    viewSize: Vec2;

    // The adorner scope.
    adorners: svg.Container;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    // The preview of items.
    onPreview: (items: DiagramItem[]) => void;

    // The preview of items.
    onPreviewEnd: () => void;

    // A function to transform a set of items.
    onTransformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => void;
}

const CORNERS = [{
    px: -1,
    py: -1,
    sx: -1,
    sy: -1,
    angle: 315,
}, {
    px: 0,
    py: -1,
    sx: 0,
    sy: -1,
    angle: 0,
}, {
    px: 0,
    py: -1,
    sx: 1,
    sy: -1,
    angle: 45,
}, {
    px: 0,
    py: 0,
    sx: 1,
    sy: 0,
    angle: 90,
}, {
    px: 0,
    py: 0,
    sx: 1,
    sy: 1,
    angle: 135,
}, {
    px: 0,
    py: 0,
    sx: 0,
    sy: 1,
    angle: 180,
}, {
    px: -1,
    py: 0,
    sx: -1,
    sy: 1,
    angle: 225,
}, {
    px: -1,
    py: 0,
    sx: -1,
    sy: 0,
    angle: 270,
}];

export class TransformAdorner extends React.PureComponent<TransformAdornerProps> implements InteractionHandler {
    private transform: Transform;
    private startTransform: Transform;
    private allElements: svg.Element[];
    private overlays: InteractionOverlays;
    private canResizeX: boolean;
    private canResizeY: boolean;
    private manipulated = false;
    private manipulationMode = 0;
    private moveShape: svg.Element;
    private dragStart: Vec2;
    private resizeConfig: any;
    private resizeShapes: svg.Element[] = [];
    private snapManager = new SnapManager();

    constructor(props: TransformAdornerProps) {
        super(props);

        this.createMoveShape();
        this.createResizeShapes();

        this.allElements = [...this.resizeShapes, this.moveShape];

        this.props.interactionService.addHandler(this);

        this.overlays = new InteractionOverlays(this.props.adorners);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);
    }

    public componentDidUpdate() {
        this.manipulationMode = 0;
        this.manipulated = false;

        if (this.hasSelection()) {
            this.calculateInitializeTransform();
            this.calculateResizeRestrictions();
            this.layoutShapes();
        } else {
            this.hideShapes();
        }
    }

    private hasSelection(): boolean {
        return this.props.selectedItems.length > 0;
    }

    private calculateInitializeTransform() {
        const bounds = this.props.selectedItems.map(x => x.bounds(this.props.selectedDiagram));

        this.transform = Transform.createFromTransforms(bounds);
    }

    private calculateResizeRestrictions() {
        this.canResizeX = false;
        this.canResizeY = false;

        for (const item of this.props.selectedItems) {
            if (item.constraint) {
                if (!item.constraint.calculateSizeX()) {
                    this.canResizeX = true;
                }

                if (!item.constraint.calculateSizeY()) {
                    this.canResizeY = true;
                }
            } else {
                this.canResizeX = true;
                this.canResizeY = true;
            }
        }
    }

    public onKeyUp(event: KeyboardEvent, next: (event: KeyboardEvent) => void) {
        if (!isNoInputFocused()) {
            next(event);
            return;
        }

        let xd = 0;
        let yd = 0;

        switch (event.key) {
            case 'ArrowLeft':
                xd = -1;
                break;
            case 'ArrowRight':
                xd = +1;
                break;
            case 'ArrowUp':
                yd = -1;
                break;
            case 'ArrowDown':
                yd = 1;
                break;
        }

        if (xd === 0 && yd === 0) {
            next(event);
            return;
        }

        if (event.shiftKey) {
            xd *= 10;
            yd *= 10;
        }

        const previousTranform = this.transform;

        this.transform = previousTranform.moveBy(new Vec2(xd, yd));

        this.props.onPreviewEnd();
        this.props.onTransformItems(
            this.props.selectedDiagram,
            this.props.selectedItems,
            previousTranform,
            this.transform);

        this.startTransform = this.transform;

        stopEvent(event);
    }

    public onMouseDown(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (event.event.ctrlKey) {
            next(event);
            return;
        }

        let hitItem = this.hitTest(event.position);

        if (!hitItem) {
            next(event);
        }

        hitItem = this.hitTest(event.position);

        if (!hitItem) {
            this.manipulationMode = 0;
            return;
        }

        this.manipulated = false;

        if (hitItem === this.moveShape) {
            this.manipulationMode = MODE_MOVE;
        } else {
            this.manipulationMode = MODE_RESIZE;

            this.resizeConfig = hitItem['config'];
        }

        this.dragStart = event.position;

        this.startTransform = this.transform;
    }

    private hitTest(point: Vec2) {
        if (!this.transform) {
            return null;
        }

        for (const element of this.allElements) {
            const box = SVGRenderer2.INSTANCE.getBounds(element);

            if (box.contains(point)) {
                return element;
            }
        }

        return null;
    }

    public onMouseDrag(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (this.manipulationMode === 0 || !this.dragStart) {
            next(event);
            return;
        }

        this.overlays.reset();

        const delta = event.position.sub(this.dragStart);

        if (delta.lengthSquared === 0) {
            return;
        }

        if (this.manipulationMode !== 0) {
            this.manipulated = true;

            if (this.manipulationMode === MODE_MOVE) {
                this.move(delta, event.event.shiftKey);
            } else {
                this.resize(delta, event.event.shiftKey);
            }

            const previews = this.props.selectedItems.map(x => x.transformByBounds(this.startTransform, this.transform));

            this.props.onPreview(previews);

            this.layoutShapes();
        }
    }

    private move(delta: Vec2, shiftKey: boolean) {
        const snapResult = this.snapManager.snapMoving(this.props.selectedDiagram, this.props.viewSize, this.startTransform, delta, shiftKey);

        this.transform = this.startTransform.moveBy(snapResult.delta);

        this.overlays.showSnapAdorners(snapResult);

        const x = Math.floor(this.transform.aabb.x);
        const y = Math.floor(this.transform.aabb.y);

        this.overlays.showInfo(this.transform, `X: ${x}, Y: ${y}`);
    }

    private resize(delta: Vec2, shiftKey: boolean) {
        const deltaSize = this.getResizeDeltaSize(delta, shiftKey);
        const deltaMove = this.getResizeDeltaPosition(deltaSize);

        this.transform = this.startTransform.resizeAndMoveBy(deltaSize, deltaMove);

        const w = Math.floor(this.transform.size.x);
        const h = Math.floor(this.transform.size.y);

        this.overlays.showInfo(this.transform, `Width: ${w}, Height: ${h}`);
    }

    private getResizeDeltaSize(delta: Vec2, shiftKey: boolean) {
        const w = this.resizeConfig.sx * delta.x;
        const h = this.resizeConfig.sy * delta.y;

        const deltaSize = new Vec2(w, h);

        const snapResult =
            this.snapManager.snapResizing(this.props.selectedDiagram, this.props.viewSize, this.startTransform, deltaSize, shiftKey,
                this.resizeConfig.sx,
                this.resizeConfig.sy);

        this.overlays.showSnapAdorners(snapResult);

        return snapResult.delta;
    }

    private getResizeDeltaPosition(delta: Vec2) {
        const x = this.resizeConfig.px * delta.x;
        const y = this.resizeConfig.py * delta.y;

        return new Vec2(x, y);
    }

    public onMouseUp(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (this.manipulationMode === 0) {
            next(event);
            return;
        }

        try {
            this.overlays.reset();

            if (this.manipulationMode !== 0 && this.manipulated) {
                this.props.onTransformItems(
                    this.props.selectedDiagram,
                    this.props.selectedItems,
                    this.startTransform,
                    this.transform);
            }
        } finally {
            this.manipulationMode = 0;
            this.manipulated = false;
        }
    }

    private layoutShapes() {
        if (this.resizeShapes === null) {
            return;
        }

        const size = this.transform.size;

        const position = this.transform.position;

        const cx = position.x + 0.5 * size.x;
        const cy = position.y + 0.5 * size.y;

        for (const resizeShape of this.resizeShapes) {
            const config = resizeShape['config'];

            SVGHelper.transform(resizeShape, {
                x: cx - 7 + config.sx * 0.5 * (size.x + 4),
                y: cy - 7 + config.sy * 0.5 * (size.y + 4),
            });

            const visible =
                (config.sx === 0 || this.canResizeX) &&
                (config.sy === 0 || this.canResizeY);

            if (visible) {
                resizeShape.show();
            } else {
                resizeShape.hide();
            }
        }

        this.moveShape.show();

        SVGHelper.transform(this.moveShape, {
            x: position.x - 1,
            y: position.y - 1,
            w: size.x + 2,
            h: size.y + 2,
        });
    }

    private hideShapes() {
        this.allElements.forEach(s => s.hide());
    }

    private createMoveShape() {
        const moveShape =
            this.props.adorners.rect(1)
                .stroke({ color: TRANSFORMER_STROKE_COLOR, width: 1 }).fill('none').hide();

        this.props.interactionService.setCursor(moveShape, 'move');

        this.moveShape = moveShape;
    }

    private createResizeShapes() {
        for (const config of CORNERS) {
            const resizeShape =
                this.props.adorners.rect()
                    .stroke({ color: TRANSFORMER_STROKE_COLOR, width: 1 }).fill(TRANSFORMER_FILL_COLOR).hide().size(14, 14);

            resizeShape['config'] = config;

            this.props.interactionService.setCursorAngle(resizeShape, config.angle);

            this.resizeShapes.push(resizeShape);
        }
    }

    public render(): any {
        return null;
    }
}

function isNoInputFocused() {
    const focusedElement = document.activeElement?.tagName?.toLowerCase();

    return focusedElement !== 'input' && focusedElement !== 'textarea';
}

function stopEvent(event: KeyboardEvent) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
}
