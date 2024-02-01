/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Color, sizeInPx, SVGHelper } from '@app/core/utils';
import { SnapLine, SnapResult, Transform } from '@app/wireframes/model';
import { SVGRenderer2 } from './../shapes/utils/svg-renderer2';

const COLOR_RED = Color.RED.toString();
const COLOR_BLUE = Color.RED.toString();
const COLOR_PURPLE = '#a020f0';

const MIN_VALUE = -10000;
const MAX_VALUE = 10000;

export class InteractionOverlays {
    private readonly lines: svg.Line[] = [];
    private readonly labels: svg.G[] = [];
    private readonly textWidthCache: { [fontSize: string]: number } = {};
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
        const lineWidth = 1 / this.zoom;

        if (!line.positions) {
            // Use rounding at the propery side and a offset of 0.5 pixels to have clear lines.
            const x = getLinePosition(line, lineWidth);

            this.renderLine(x, MIN_VALUE, x, MAX_VALUE, getLineColor(line), lineWidth);
        } else if (line.diff) {
            const dx = line.diff.x;

            // The label dimensions needs to be calculated based on the zoom factor.
            const labelOffset = 6 / this.zoom;
    
            for (const position of line.positions) {
                const x = Math.round(position.x);
                const y = Math.round(position.y);

                this.renderLine(x, y, x + dx, y, COLOR_PURPLE, lineWidth);
                this.renderLabel(x + 0.5 * dx, y + labelOffset, line.diff.x.toString(), COLOR_PURPLE, 10, true, false, 2);
            }
        }
    }

    public renderYLine(line: SnapLine) {
        const lineWidth = 1 / this.zoom;
    
        if (!line.positions) {
            // Use rounding at the propery side and a offset of 0.5 pixels to have clear lines.
            const y = getLinePosition(line, lineWidth);

            this.renderLine(MIN_VALUE, y, MAX_VALUE, y, getLineColor(line), lineWidth);
        } else if (line.diff) {
            const dy = line.diff.y;

            const labelOffset = 6 / this.zoom;
    
            for (const position of line.positions) {
                const x = Math.round(position.x);
                const y = Math.round(position.y);

                this.renderLine(x, y, x, y + dy, COLOR_PURPLE, lineWidth);
                this.renderLabel(x + labelOffset, y + 0.5 * dy, line.diff.y.toString(), COLOR_PURPLE, 10, false, true, 2);
            }
        }
    }

    public showInfo(transform: Transform, text: string) {
        const aabb = transform.aabb;

        this.renderLabel(aabb.right + 4, aabb.bottom + 24, text, '#000');
    }

    private renderLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number) {
        let line = this.lines[this.indexLines];

        // Reuse the rect and text if it alreadx exists to avoid creating unnecessary DOM elements.
        if (!line) {
            line = this.layer.line();
            this.lines.push(line);
        } else {
            line.show();
        }

        line.plot(x1, y1, x2, y2).stroke({ width, color });
        this.indexLines++;
    }

    private renderLabel(x: number, y: number, text: string, color: string, fontSize = 16, centerX = false, centerY = false, padding = 4) {
        let labelGroup = this.labels[this.indexLabels];
        let labelRect: svg.Rect;
        let labelText: svg.ForeignObject;

        // Reuse the rect and text if it alreadx exists to avoid creating unnecessary DOM elements.
        if (!labelGroup) {
            labelGroup = this.layer.group();

            labelRect = new svg.Rect().addTo(labelGroup);
            labelText = SVGHelper.createText(text, fontSize, 'center', 'middle').attr('color', '#fff').addTo(labelGroup);

            this.labels.push(labelGroup);
        } else {
            labelGroup.show();

            labelRect = labelGroup.children().at(0) as svg.Rect;
            labelText = labelGroup.children().at(1) as svg.ForeignObject;
        }

        let characterWidthKey = fontSize.toString();
        let characterWidthValue = this.textWidthCache[characterWidthKey];

        if (!characterWidthValue) {
            // We use a monospace, so we can calculate the text width ourself, which saves a lot of performance.
            characterWidthValue = SVGRenderer2.INSTANCE.getTextWidth('a', fontSize, 'monospace');

            this.textWidthCache[characterWidthKey] = characterWidthValue;
        }

        // The width is just calculated by the width of a single character (therefore monospace) and the total length.
        const w = characterWidthValue * text.length / this.zoom;

        // We assume a line height of 1.5 here.
        const h = fontSize * 1.5 / this.zoom;

        if (centerX) {
            x -= 0.5 * w;
        }

        if (centerY) {
            y -= 0.5 * h;
        }

        const labelContent = labelText.node.children[0] as HTMLDivElement;

        labelContent.style.fontSize = sizeInPx(fontSize / this.zoom);
        labelContent.style.fontFamily = 'monospace';
        labelContent.textContent = text;
        labelRect.fill(color);

        // The label dimensions needs to be calculated based on the zoom factor.
        padding /= this.zoom;

        SVGHelper.transformBy(labelGroup, {
            x: x - padding,
            y: y - padding,
        });

        SVGHelper.transformBy(labelText, {
            x: padding,
            y: padding,
            w: w,
            h: h,
        });

        SVGHelper.transformBy(labelRect, {
            w: w + 2 * padding,
            h: h + 2 * padding,
        });

        // Increment by one because we create one group per label.
        this.indexLabels += 1;
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

function getLineColor(line: SnapLine) {
    return line.isCenter ? COLOR_BLUE : COLOR_RED;
}

function getLinePosition(line: SnapLine, lineWidth: number) {
    const isLeftOrTop = line.side === 'Left' || line.side === 'Top';

    return Math.floor(line.value) + (isLeftOrTop ? -0.5 : 0.5) * lineWidth;
}