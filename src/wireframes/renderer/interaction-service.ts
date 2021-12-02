/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Vec2 } from '@app/core';
import { DiagramItem } from '@app/wireframes/model';
import * as svg from 'svg.js';

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
    onDoubleClick?(event: SvgEvent, next: (event: SvgEvent) => void): void;

    onClick?(event: SvgEvent, next: (event: SvgEvent) => void): boolean;

    onMouseDown?(event: SvgEvent, next: (event: SvgEvent) => void): void;

    onMouseDrag?(event: SvgEvent, next: (event: SvgEvent) => void): void;

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

export class InteractionService {
    private readonly interactionHandlers: InteractionHandler[] = [];
    private isDragging = false;

    constructor(
        private readonly adornerLayers: svg.Element[], renderings: svg.Element, private readonly diagram: svg.Doc,
    ) {
        const onClick = this.buildMouseEvent(h => h?.onClick);
        const onKeyUp = this.buildKeyboardEvent(h => h.onKeyDown?.bind(h));
        const onKeyDown = this.buildKeyboardEvent(h => h.onKeyDown?.bind(h));
        const onDoubleClick = this.buildMouseEvent(h => h?.onDoubleClick);
        const onMouseDown = this.buildMouseEvent(h => h?.onMouseDown);
        const onMouseDrag = this.buildMouseEvent(h => h?.onMouseDrag);
        const onMouseUp = this.buildMouseEvent(h => h?.onMouseUp);

        renderings.dblclick(onDoubleClick);
        renderings.click(onClick);

        diagram.on('keyup', onKeyUp);
        diagram.on('keydown', onKeyDown);

        diagram.mousemove((event: MouseEvent) => {
            this.onMouseMove(event);
        });

        diagram.mousedown((event: MouseEvent) => {
            this.isDragging = true;

            onMouseDown(event);
        });

        window.document.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = true;

                onMouseDrag(event);
            }
        });

        window.document.addEventListener('mouseup', (event: MouseEvent) => {
            if (this.isDragging) {
                this.isDragging = false;

                onMouseUp(event);
            }
        });
    }

    public addHandler(handler: InteractionHandler) {
        this.interactionHandlers.push(handler);
    }

    public removeHandler(handler: InteractionHandler) {
        this.interactionHandlers.splice(this.interactionHandlers.indexOf(handler), 1);
    }

    public setCursor(item: svg.Element, cursor: string) {
        item.node['cursor'] = cursor;
    }

    public setCursorAngle(item: svg.Element, angle: number) {
        item.node['cursorAngle'] = angle;
    }

    public showAdorners() {
        this.adornerLayers.forEach(l => l.show());
    }

    public hideAdorners() {
        this.adornerLayers.forEach(l => l.hide());
    }

    private buildKeyboardEvent(actionProvider: (handler: InteractionHandler) => Function) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let result = (_: KeyboardEvent) => {};

        if (this.interactionHandlers.length > 0) {
            const handlers: Function[] = [];

            for (let i = this.interactionHandlers.length - 1; i >= 0; i--) {
                const handler = actionProvider(this.interactionHandlers[i]);

                handlers?.push(handler);
            }

            if (handlers.length > 0) {
                for (const handler of handlers) {
                    const next = result;

                    result = event => handler(event, next);
                }
            }
        }

        return result;
    }

    private buildMouseEvent(actionProvider: (handler: InteractionHandler) => Function) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let result = (_: MouseEvent) => {};

        if (this.interactionHandlers.length > 0) {
            const handlers: Function[] = [];

            for (let i = this.interactionHandlers.length - 1; i >= 0; i--) {
                const handler = actionProvider(this.interactionHandlers[i]);

                handlers?.push(handler);
            }

            if (handlers.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                let next = (_: SvgEvent) => {};

                for (const handler of handlers) {
                    const currentNext = next;

                    next = event => handler(event, currentNext);
                }

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
                        new SvgEvent(event, new Vec2(x, y),
                            currentElement,
                            currentElement?.shape || null);

                    next(svgEvent);
                };
            }
        }

        return result;
    }

    private onMouseMove = (event: MouseEvent) => {
        const element: any = event.target;

        if (element && element['cursor']) {
            document.body.style.cursor = element['cursor'];
        } else if (element && Number.isFinite(element['cursorAngle'])) {
            const rotation = element['cursorAngle'];

            const baseRotation = svg.adopt(element).transform().rotation;

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
