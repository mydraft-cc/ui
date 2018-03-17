import * as paper from 'paper';

import { MathHelper } from '@app/core';

export interface InteractionHandler {
    onDoubleClick?(event: paper.ToolEvent, next: () => void): void;

    onClick?(event: paper.ToolEvent, next: () => void): boolean;

    onMouseDown?(event: paper.ToolEvent, next: () => void): void;

    onMouseDrag?(event: paper.ToolEvent, next: () => void): void;

    onMouseUp?(event: paper.ToolEvent, next: () => void): void;

    onKeyDown?(event: paper.KeyEvent, next: () => void): void;

    onKeyUp?(event: paper.KeyEvent, next: () => void): void;
}

const ROTATION_CONFIG = [
    { angle: 45, cursor: 'ne-resize' },
    { angle: 90, cursor: 'e-resize' },
    { angle: 135, cursor: 'se-resize' },
    { angle: 180, cursor: 's-resize' },
    { angle: 215, cursor: 'sw-resize' },
    { angle: 270, cursor: 'w-resize' },
    { angle: 315, cursor: 'nw-resize' }
];

const NOOP = () => { /* NOOP */ };

export class InteractionService {
    private interactionHandlers: InteractionHandler[] = [];
    private interactionTool: paper.Tool;
    private adornerLayers: paper.Layer[] = [];
    private layer: paper.Layer;

    public init(scope: paper.PaperScope) {
        this.layer = scope.project.activeLayer;

        this.initializeTool(scope);
        this.initializeClickEvents();
    }

    private initializeTool(scope: paper.PaperScope) {
        this.interactionTool = new paper.Tool();
        this.interactionTool.minDistance = 1;
        this.interactionTool.onMouseDown = this.onMouseDown;
        this.interactionTool.onMouseDrag = this.onMouseDrag;
        this.interactionTool.onMouseMove = this.onMouseMove;
        this.interactionTool.onMouseUp = this.onMouseUp;

        scope.tool = this.interactionTool;
    }

    private initializeClickEvents() {
        this.layer.onClick = this.onClick;
        this.layer.onDoubleClick = this.onDoubleClick;
    }

    public addAdornerLayer(layer: paper.Layer) {
        this.adornerLayers.push(layer);
    }

    public removeAdornerLayer(layer: paper.Layer) {
        this.adornerLayers.splice(this.adornerLayers.indexOf(layer), 1);
    }

    public showAdornerLayers(visible: boolean) {
        this.adornerLayers.forEach(layer => layer.visible = visible);
    }

    public addHandler(handler: InteractionHandler) {
        this.interactionHandlers.push(handler);
    }

    public removeHandler(handler: InteractionHandler) {
        this.interactionHandlers.splice(this.interactionHandlers.indexOf(handler), 1);
    }

    public setCursor(item: paper.Item, cursor: string) {
        item['cursor'] = cursor;
    }

    public setRotationCursor(item: paper.Item, angle: number) {
        item['cursorAngle'] = angle;
    }

    public isControlKeyPressed(): boolean {
        return paper.Key.isDown('control');
    }

    public isShiftKeyPressed() {
        return paper.Key.isDown('shift');
    }

    private invokeEvent(event: any, actionProvider: (handler: InteractionHandler) => Function) {
        if (this.interactionHandlers.length > 0) {
            let next = NOOP;

            for (let i = this.interactionHandlers.length - 1; i >= 0; i--) {
                const action = actionProvider(this.interactionHandlers[i]);

                if (action) {
                    const currentNext = next;

                    next = () => action(event, currentNext);
                }
            }

            next();
        }
    }

    private onDoubleClick = (e: paper.MouseEvent) => {
        const eventBuilder: any = paper.ToolEvent;
        const event = new eventBuilder(this.interactionTool, 'doubleclick', e);

        this.invokeEvent(event, h => h.onDoubleClick ? h.onDoubleClick.bind(h) : null);
    }

    private onClick = (e: paper.MouseEvent) => {
        const eventBuilder: any = paper.ToolEvent;
        const event = new eventBuilder(this.interactionTool, 'click', e);

        this.invokeEvent(event, h => h.onClick ? h.onClick.bind(h) : null);
    }

    private onMouseDown = (event: paper.ToolEvent) => {
        this.invokeEvent(event, h => h.onMouseDown ? h.onMouseDown.bind(h) : null);
    }

    private onMouseUp = (event: paper.ToolEvent) => {
        this.invokeEvent(event, h => h.onMouseUp ? h.onMouseUp.bind(h) : null);
    }

    private onMouseDrag = (event: paper.ToolEvent) => {
        this.invokeEvent(event, h => h.onMouseDrag ? h.onMouseDrag.bind(h) : null);
    }

    private onMouseMove = (event: paper.ToolEvent) => {
        for (let layer of this.adornerLayers) {
            const hitResult = layer.hitTest(event.point, { guides: true, fill: true, tolerance: 2 });
            const hitItem = hitResult ? hitResult.item : null;

            if (hitItem && hitItem['cursor']) {
                document.body.style.cursor = hitItem['cursor'];
            } else if (hitItem && Number.isFinite(hitItem['cursorAngle'])) {
                const rotation = hitItem['cursorAngle'];

                const totalRotation = MathHelper.toPositiveDegree(hitItem.rotation + rotation);

                for (let config of ROTATION_CONFIG) {
                    if (totalRotation > config.angle - 22.5 &&
                        totalRotation < config.angle + 22.5) {

                        document.body.style.cursor = config.cursor;
                        return;
                    }
                }

                document.body.style.cursor = 'n-resize';
            } else {
                document.body.style.cursor = 'default';
            }
        }
    }
}