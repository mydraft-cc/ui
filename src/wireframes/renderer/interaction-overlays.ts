/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Color, Rect2, SVGHelper, Vec2 } from '@app/core';
import { SnapLine, SnapMode, SnapMoveResult, SnapResult, Transform } from '@app/wireframes/model';
import { SVGRenderer2 } from '../shapes/utils/svg-renderer2';

const COLOR_RED = Color.RED.toString();
const COLOR_BLUE = Color.RED.toString();
const COLOR_PURPLE = '#a020f0';

export class InteractionOverlays {
    private readonly infoRect: svg.Rect;
    private readonly infoText: svg.Element;
    private readonly elements: svg.Element[] = [];
    private index = 0;

    constructor(
        private readonly layer: svg.Container,
    ) {
        this.infoRect = layer.rect().fill('#000');
        this.infoText = SVGHelper.createText('text', 16, 'center', 'middle').attr('color', '#fff').addTo(layer);

        this.elements.push(this.infoRect);
        this.elements.push(this.infoText);

        this.reset();
    }

    public showSnapAdorners(snapResult: SnapResult) {
        if (snapResult.snapModeX === SnapMode.LeftTop) {
            this.showXLine(snapResult.snapValueX! - 1, COLOR_RED);
        } else if (snapResult.snapValueX && snapResult.snapModeX === SnapMode.RightBottom) {
            this.showXLine(snapResult.snapValueX, COLOR_RED);
        } else if (snapResult.snapValueX && snapResult.snapModeX === SnapMode.Center) {
            this.showXLine(snapResult.snapValueX, COLOR_BLUE);
        }

        if (snapResult.snapModeY === SnapMode.LeftTop) {
            this.showYLine(snapResult.snapValueY! - 1, COLOR_RED);
        } else if (snapResult.snapValueY && snapResult.snapModeY === SnapMode.RightBottom) {
            this.showYLine(snapResult.snapValueY, COLOR_BLUE);
        } else if (snapResult.snapValueY && snapResult.snapModeY === SnapMode.Center) {
            this.showYLine(snapResult.snapValueY, COLOR_BLUE);
        }
    }

    public showSnapAdorners2(snapResult: SnapMoveResult) {
        if (snapResult.snapLineX) {
            this.renderXLine(snapResult.snapLineX);
        }

        if (snapResult.snapLineY) {
            this.renderYLine(snapResult.snapLineY);
        }
    }

    public renderXLine(line: SnapLine) {
        if (!line.positions) {
            this.showXLine(line.value - 1, line.isCenter ? COLOR_BLUE : COLOR_RED);
        } else if (line.diff) {
            this.renderDeltas(line.positions, line.diff);
        }
    }

    public renderYLine(line: SnapLine) {
        if (!line.positions) {
            this.showYLine(line.value - 1, line.isCenter ? COLOR_BLUE : COLOR_RED);
        } else if (line.diff) {
            this.renderDeltas(line.positions, line.diff);
        }
    }

    private renderDeltas(positions: Vec2[], diff: Vec2) {
        const dx = diff.x;
        const dy = diff.y;

        for (const position of positions) {
            const { x, y } = position;

            this.renderLine(x, y, dx, dy, COLOR_PURPLE);
        }
    }

    public showXLine(value: number, color: string) {
        this.renderLine(value, -4000, 1, 10000, color);
    }

    public showYLine(value: number, color: string) {
        this.renderLine(-4000, value, 10000, 1, color);
    }

    private renderLine(x: number, y: number, w: number, h: number, color: string) {
        let line = this.elements[this.index];

        if (!line) {
            line = this.layer.rect();
            this.elements.push(line);
        } else {
            line.show();
        }

        line.fill(color);

        SVGHelper.transform(line, { x, y, w, h });

        this.index++;
    }

    public showInfo(transform: Transform, text: string) {
        const aabb = transform.aabb;

        const width = SVGRenderer2.INSTANCE.getTextWidth(text, 16, 'inherit');

        const bounds = new Rect2(aabb.right + 4, aabb.bottom + 24, width + 20, 24);

        this.infoRect.show();
        this.infoText.node.children[0].textContent = text;
        this.infoText.show();

        SVGHelper.transform(this.infoText, { rect: bounds });
        SVGHelper.transform(this.infoRect, { rect: bounds.inflate(4) });
    }

    public reset() {
        this.index = 2;

        for (const element of this.elements) {
            element.hide();
        }
    }
}
