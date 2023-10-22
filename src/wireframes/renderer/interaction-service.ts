/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { MathHelper, Vec2 } from '@app/core/utils';
import { DiagramItem } from '@app/wireframes/model';

export class SvgEvent {
    constructor(
        public readonly event: MouseEvent,
        public readonly position: Vec2,
        public readonly element?: Element | null,
        public readonly shape?: DiagramItem | null,
    ) {
    }
}

export interface InteractionHandler {
    onBlur?(event: FocusEvent, next: (event: FocusEvent) => void): void;
    onDoubleClick?(event: SvgEvent, next: (event: SvgEvent) => void): void;
    onClick?(event: SvgEvent, next: (event: SvgEvent) => void): boolean;
    onMouseDown?(event: SvgEvent, next: (event: SvgEvent) => void): void;
    onMouseDrag?(event: SvgEvent, next: (event: SvgEvent) => void): void;
    onMouseMove?(event: SvgEvent, next: (event: SvgEvent) => void): void;
    onMouseUp?(event: SvgEvent, next: (event: SvgEvent) => void): void;
    onKeyDown?(event: KeyboardEvent, next: (event: KeyboardEvent) => void): void;
    onKeyUp?(event: KeyboardEvent, next: (event: KeyboardEvent) => void): void;
}

const ROTATION_CONFIG = [
    { angle: 45, cursor: 'ne-resize' },
    { angle: 90, cursor: 'e-resize' },
    { angle: 135, cursor: 'se-resize' },
    { angle: 180, cursor: 's-resize' },
    { angle: 215, cursor: 'sw-resize' },
    { angle: 270, cursor: 'w-resize' },
    { angle: 315, cursor: 'nw-resize' },
];

const NOOP: (value: any) => void = () => {};

export class InteractionService {
    private readonly interactionHandlers: InteractionHandler[] = [];
    private isDragging = false;
    private onClick: Function = NOOP;
    private onKeyUp: Function = NOOP;
    private onKeyDown: Function = NOOP;
    private onDoubleClick: Function = NOOP;
    private onMouseDown: Function = NOOP;
    private onMouseDrag: Function = NOOP;
    private onMouseMove: Function = NOOP;
    private onMouseUp: Function = NOOP;
    private onBlur: Function = NOOP;

    constructor(
        private readonly adornerLayers: svg.Element[], renderings: svg.Element, private readonly diagram: svg.Svg,
    ) {
        renderings.dblclick((event: MouseEvent) => {
            this.onDoubleClick(event);
        });

        renderings.click((event: MouseEvent) => {
            this.onClick(event);
        });

        diagram.mousemove((event: MouseEvent) => {
            this.handleMouseMove(event);

            this.onMouseMove(event);
        });

        diagram.mousedown((event: MouseEvent) => {
            this.isDragging = true;

            this.onMouseDown(event);
        });

        window.addEventListener('blur', (event: FocusEvent) => {
            this.onBlur(event);
        });

        window.document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.onKeyUp(event);
        });

        window.document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.onKeyDown(event);
        });

        window.document.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = true;

                this.onMouseDrag(event);
            }
        });

        window.document.addEventListener('mouseup', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = false;

                this.onMouseUp(event);
            }
        });
    }

    public addHandler(handler: InteractionHandler) {
        this.interactionHandlers.push(handler);

        this.rebuild();
    }

    public removeHandler(handler: InteractionHandler) {
        this.interactionHandlers.splice(this.interactionHandlers.indexOf(handler), 1);

        this.rebuild();
    }

    private rebuild() {
        this.onBlur = this.buildEvent(h => h?.onBlur?.bind(h));
        this.onClick = this.buildMouseEvent(h => h?.onClick?.bind(h));
        this.onKeyUp = this.buildEvent(h => h.onKeyUp?.bind(h));
        this.onKeyDown = this.buildEvent(h => h.onKeyDown?.bind(h));
        this.onDoubleClick = this.buildMouseEvent(h => h?.onDoubleClick?.bind(h));
        this.onMouseMove = this.buildMouseEvent(h => h?.onMouseMove?.bind(h));
        this.onMouseDown = this.buildMouseEvent(h => h?.onMouseDown?.bind(h));
        this.onMouseDrag = this.buildMouseEvent(h => h?.onMouseDrag?.bind(h));
        this.onMouseUp = this.buildMouseEvent(h => h?.onMouseUp?.bind(h));
    }

    public setCursor(item: svg.Element, cursor: string) {
        (item.node as any)['cursor'] = cursor;
    }

    public setCursorAngle(item: svg.Element, angle: number) {
        (item.node as any)['cursorAngle'] = angle;
    }

    public showAdorners() {
        this.adornerLayers.forEach(l => l.show());
    }

    public hideAdorners() {
        this.adornerLayers.forEach(l => l.hide());
    }

    private buildEvent(actionProvider: (handler: InteractionHandler) => Function | undefined) {
        let result = NOOP;

        for (let i = this.interactionHandlers.length - 1; i >= 0; i--) {
            const handler = actionProvider(this.interactionHandlers[i]);

            if (handler) {
                const next = result;

                result = event => handler(event, next);
            }
        }

        return result;
    }

    private buildMouseEvent(actionProvider: (handler: InteractionHandler) => Function | undefined) {
        let result = NOOP;

        const inner = this.buildEvent(actionProvider);

        if (inner !== NOOP) {
            const diagram = this.diagram;

            result = (event: MouseEvent) => {
                let currentTarget: any = event.target;
                let currentElement: any = null;

                while (currentTarget && currentTarget.parentElement) {
                    currentTarget = currentTarget.parentElement;

                    if (currentTarget.shape) {
                        currentElement = currentTarget;
                        break;
                    }
                }

                const { x, y } = diagram.point(event.pageX, event.pageY);

                const svgEvent =
                    new SvgEvent(event, new Vec2(Math.round(x), Math.round(y)),
                        currentElement,
                        currentElement?.shape || null);

                inner(svgEvent);
            };
        }

        return result;
    }

    private handleMouseMove = (event: MouseEvent) => {
        const element: any = event.target;

        if (element && element['cursor']) {
            document.body.style.cursor = element['cursor'];
        } else if (element && Number.isFinite(element['cursorAngle'])) {
            const rotation = element['cursorAngle'];

            const baseRotation = svg.adopt(element).transform().rotate;

            const totalRotation = MathHelper.toPositiveDegree((baseRotation || 0) + rotation);

            for (const config of ROTATION_CONFIG) {
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
    };
}
