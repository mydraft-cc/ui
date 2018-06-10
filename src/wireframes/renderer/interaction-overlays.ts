import * as svg from 'svg.js';

import { Color } from '@app/core';

import {
    SnapMode,
    SnapResult,
    Transform
} from '@app/wireframes/model';

export class InteractionOverlays {
    private textItem: svg.Text;
    private rectItem: svg.Element;
    private lineX: svg.Element;
    private lineY: svg.Element;
    private elements: svg.Element[] = [];

    constructor(
        private readonly layer: svg.Container
    ) {
    }

    private ensureInfoShapes() {
        if (this.textItem) {
            return;
        }

        this.rectItem = this.layer.rect().fill('#000');

        this.textItem = this.layer.text('').size(12).fill('#fff');

        this.elements.push(this.textItem);
        this.elements.push(this.rectItem);

        this.reset();
    }

    private ensureLines() {
        if (this.lineX && this.lineY) {
            return;
        }

        this.lineX = this.layer.rect();
        this.lineY = this.layer.rect();

        this.elements.push(this.lineX);
        this.elements.push(this.lineY);

        this.reset();
    }

    public showSnapAdorners(snapResult: SnapResult) {
        if (snapResult.snapModeX === SnapMode.LeftTop) {
            this.showXLine(snapResult.snapValueX! - 1, Color.RED);
        } else if (snapResult.snapValueX && snapResult.snapModeX === SnapMode.RightBottom) {
            this.showXLine(snapResult.snapValueX, Color.RED);
        } else if (snapResult.snapValueX && snapResult.snapModeX === SnapMode.Center) {
            this.showXLine(snapResult.snapValueX, Color.BLUE);
        }

        if (snapResult.snapModeY === SnapMode.LeftTop) {
            this.showYLine(snapResult.snapValueY! - 1, Color.RED);
        } else if (snapResult.snapValueY && snapResult.snapModeY === SnapMode.RightBottom) {
            this.showYLine(snapResult.snapValueY, Color.RED);
        } else if (snapResult.snapValueY && snapResult.snapModeY === SnapMode.Center) {
            this.showYLine(snapResult.snapValueY, Color.BLUE);
        }
    }

    public showXLine(value: number, color: Color) {
        this.ensureLines();

        const height = this.layer.height();

        this.lineX.fill(color.toString());
        this.lineX.move(Math.round(value), 0);
        this.lineX.size(1, height);
        this.lineX.show();
    }

    public showYLine(value: number, color: Color) {
        this.ensureLines();

        const width = this.layer.width();

        this.lineY.fill(color.toString());
        this.lineY.move(0, Math.round(value));
        this.lineY.size(width, 1);
        this.lineY.show();
    }

    public showInfo(transform: Transform, text: string) {
        this.ensureInfoShapes();

        const aabb = transform.aabb;

        this.textItem.untransform();
        this.textItem.text(text);
        this.textItem.translate(aabb.right + 4, aabb.bottom + 24);
        this.textItem.show();
        this.textItem.rebuild(true);

        const bounds = this.textItem.bbox().transform(this.textItem.matrixify());

        this.rectItem.untransform();
        this.rectItem.translate(bounds.x - 4, bounds.y - 4);
        this.rectItem.size(bounds.w + 8, bounds.h + 8);
        this.rectItem.show();
    }

    public reset() {
        for (let element of this.elements) {
            element.hide();
        }
    }
}