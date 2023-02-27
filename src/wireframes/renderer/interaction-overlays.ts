/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Color, Rect2, sizeInPx, SVGHelper } from '@app/core';
import { SnapLine, SnapResult, Transform } from '@app/wireframes/model';
import { SVGRenderer2 } from '../shapes/utils/svg-renderer2';

const COLOR_RED = Color.RED.toString();
const COLOR_BLUE = Color.RED.toString();
const COLOR_PURPLE = '#a020f0';

export class InteractionOverlays {
    private readonly lines: svg.Element[] = [];
    private readonly labels: svg.Element[] = [];
    private indexLabels = 0;
    private indexLines = 0;
    private zoom = 1;

    constructor(
        private readonly layer: svg.Container,
    ) {
    }

    public setZoom(zoom: number) {
        this.zoom = zoom;
    }

    public showSnapAdorners(snapResult: SnapResult) {
        if (snapResult.snapX) {
            this.renderXLine(snapResult.snapX);
        }

        if (snapResult.snapY) {
            this.renderYLine(snapResult.snapY);
        }
    }

    public renderXLine(line: SnapLine) {
        if (!line.positions) {
            // Use rounding at the propery side and a offset of 0.5 pixels to have clear lines.
            const x = getPosition(line.value);

            this.renderLine(x, -4000, 1 / this.zoom, 10000, line.isCenter ? COLOR_BLUE : COLOR_RED);
        } else if (line.diff) {
            const dx = line.diff.x;
            const dy = line.diff.y / this.zoom;
    
            for (const position of line.positions) {
                const x = Math.round(position.x) + .5;
                const y = Math.round(position.y) + .5;

                this.renderLine(x, y, dx, dy, COLOR_PURPLE);
                this.renderLabel(x + 0.5 * dx, y + 6, `${dx}`, COLOR_PURPLE, 10, true, false, 2);
            }
        }
    }

    public renderYLine(line: SnapLine) {
        if (!line.positions) {
            // Use rounding at the propery side and a offset of 0.5 pixels to have clear lines.
            const y = getPosition(line.value);

            this.renderLine(-4000.5, y, 10000, 1 / this.zoom, line.isCenter ? COLOR_BLUE : COLOR_RED);
        } else if (line.diff) {
            const dx = line.diff.x;
            const dy = line.diff.y / this.zoom;
    
            for (const position of line.positions) {
                const x = Math.round(position.x) + .5;
                const y = Math.round(position.y) + .5;

                this.renderLine(x, y, dx, dy, COLOR_PURPLE);
                this.renderLabel(x + 6, y + 0.5 * dy, `${dy}`, COLOR_PURPLE, 10, false, true, 2);
            }
        }
    }

    public showInfo(transform: Transform, text: string) {
        const aabb = transform.aabb;

        this.renderLabel(aabb.right + 4, aabb.bottom + 24, text, '#000');
    }

    private renderLine(x: number, y: number, w: number, h: number, color: string) {
        let line = this.lines[this.indexLines];

        // Reuse the rect and text if it alreadx exists to avoid creating unnecessary DOM elements.
        if (!line) {
            line = this.layer.rect();
            this.lines.push(line);
        } else {
            line.show();
        }

        line.fill(color);

        SVGHelper.transform(line, { x, y, w, h }, false);

        this.indexLines++;
    }

    private renderLabel(x: number, y: number, text: string, color: string, fontSize = 16, centerX = false, centerY = false, padding = 4) {
        let labelRect = this.labels[this.indexLabels] as svg.Rect;
        let labelText = this.labels[this.indexLabels + 1] as svg.ForeignObject;

        // Reuse the rect and text if it alreadx exists to avoid creating unnecessary DOM elements.
        if (!labelRect) {
            labelRect = this.layer.rect();
            labelText = SVGHelper.createText(text, fontSize, 'center', 'middle').attr('color', '#fff').addTo(this.layer);

            this.labels.push(labelRect);
            this.labels.push(labelText);
        } else {
            labelText.show();
            labelRect.show();
        }

        const w = SVGRenderer2.INSTANCE.getTextWidth(text, fontSize, 'inherit') / this.zoom;
        const h = fontSize * 1.5 / this.zoom;

        if (centerX) {
            x -= 0.5 * w;
        }

        if (centerY) {
            y -= 0.5 * h;
        }

        const labelContent = labelText.node.children[0] as HTMLDivElement;

        labelContent.style.fontSize = sizeInPx(fontSize / this.zoom);
        labelContent.textContent = text;
        labelRect.fill(color);

        const bounds = new Rect2(x, y, w, h);

        SVGHelper.transform(labelText, { rect: bounds }, false);
        SVGHelper.transform(labelRect, { rect: bounds.inflate(padding) });

        // Increment by two because we create two DOM elements per label.
        this.indexLabels += 2;
    }

    public reset() {
        this.indexLabels = 0;
        this.indexLines = 0;

        for (const line of this.lines) {
            line.hide();
        }

        for (const label of this.labels) {
            label.hide();
        }
    }
}

function getPosition(value: number) {
    return Math.floor(value) - 0.5;
}