import * as svg from 'svg.js';

import { MathHelper, Vec2 } from '@app/core';

import { DiagramShape } from '@appwireframes/model';

export class SvgEvent {
    constructor(
        public readonly event: MouseEvent,
        public readonly position: Vec2,
        public readonly element?: Element | null,
        public readonly shape?: DiagramShape | null
    ) {
    }
}

export interface InteractionHandler {
    onDoubleClick?(event: SvgEvent, next: () => void): void;

    onClick?(event: SvgEvent, next: () => void): boolean;

    onMouseDown?(event: SvgEvent, next: () => void): void;

    onMouseDrag?(event: SvgEvent, next: () => void): void;

    onMouseUp?(event: SvgEvent, next: () => void): void;
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
    private readonly interactionHandlers: InteractionHandler[] = [];

    constructor(diagramAdorners: svg.Container, diagramRenderings: svg.Container
    ) {
        diagramAdorners.mousedown((event: MouseEvent) => {
            this.invokeEvent(event, diagramAdorners, h => h.onMouseDown ? h.onMouseDown.bind(h) : null);
        });

        diagramAdorners.mousedown((event: MouseEvent) => {
            this.invokeEvent(event, diagramAdorners, h => h.onMouseDrag ? h.onMouseDrag.bind(h) : null);
        });

        diagramAdorners.mouseup((event: MouseEvent) => {
            this.invokeEvent(event, diagramAdorners, h => h.onMouseDown ? h.onMouseDown.bind(h) : null);
        });

        diagramRenderings.click((event: MouseEvent) => {
            this.invokeEvent(event, diagramRenderings, h => h.onClick ? h.onClick.bind(h) : null);
        });

        diagramAdorners.mousemove(this.onMouseMove);
    }

    public addHandler(handler: InteractionHandler) {
        this.interactionHandlers.push(handler);
    }

    public removeHandler(handler: InteractionHandler) {
        this.interactionHandlers.splice(this.interactionHandlers.indexOf(handler), 1);
    }

    public setCursor(item: svg.Element, cursor: string) {
        item['cursor'] = cursor;
    }

    public setCursorAngle(item: svg.Element, angle: number) {
        item['cursorAngle'] = angle;
    }

    public isControlKeyPressed(): boolean {
        return paper.Key.isDown('control');
    }

    public isShiftKeyPressed() {
        return paper.Key.isDown('shift');
    }

    private invokeEvent(event: MouseEvent, layer: svg.Container, actionProvider: (handler: InteractionHandler) => Function) {
        if (this.interactionHandlers.length > 0) {
            const handlers: Function[] = [];

            for (let i = this.interactionHandlers.length - 1; i >= 0; i--) {
                const handler = actionProvider(this.interactionHandlers[i]);

                if (handler) {
                    handlers.push(handler);
                }
            }

            if (handlers.length > 0) {
                const layerElement: SVGElement = <any>layer.node;

                let element: SVGElement | null = <SVGElement>event.target;

                while (element && element !== layerElement && <any>element.parentElement !== layerElement) {
                    element = <SVGElement | null>element.parentElement;
                }

                const svgEvent = new SvgEvent(event, Vec2.ZERO, element, null);

                let next = NOOP;

                for (let handler of handlers) {
                    const currentNext = next;

                    next = () => handler(svgEvent, currentNext);
                }

                next();
            }
        }
    }

    /*
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
    */

    private onMouseMove = (event: MouseEvent) => {
        let element: SVGElement | null = <SVGElement | null>event.target;

        if (element && element['cursor']) {
            document.body.style.cursor = element['cursor'];
        } else if (element && Number.isFinite(element['cursorAngle'])) {
            const rotation = element['cursorAngle'];

            const totalRotation = MathHelper.toPositiveDegree(0 + rotation);

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