import * as svg from 'svg.js';

import { Color, Rect2 } from '@app/core';

import {
    SnapMode,
    SnapResult,
    Transform
} from '@app/wireframes/model';

import { SVGRenderer } from '@app/wireframes/shapes/utils/svg-renderer';

export class InteractionOverlays {
    private infoRect: any;
    private infoText: any;
    private lineX: any;
    private lineY: any;
    private elements: any[] = [];
    private readonly renderer: SVGRenderer;

    constructor(
        private readonly layer: svg.Container
    ) {
        this.renderer = new SVGRenderer();
        this.renderer.captureContext(layer);

        this.lineX = this.renderer.createRectangle(Rect2.ZERO, 0, 0);
        this.lineY = this.renderer.createRectangle(Rect2.ZERO, 0, 0);

        this.elements.push(this.lineX);
        this.elements.push(this.lineY);

        this.infoRect = this.renderer.createRectangle(Rect2.ZERO, 0, 0);
        this.infoText = this.renderer.createSinglelineText(Rect2.ZERO, { text: '' });
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
        const height = this.layer.height();

        this.renderer.transform(this.lineX, { x: value, y: 0, w: 1, h: height });
        this.renderer.setBackgroundColor(this.lineX, color);
        this.renderer.setVisibility(this.lineX, true);
    }

    public showYLine(value: number, color: Color) {
        const width = this.layer.width();

        this.renderer.transform(this.lineY, { x: 0, y: value, w: width, h: 1 });
        this.renderer.setBackgroundColor(this.lineY, color);
        this.renderer.setVisibility(this.lineY, true);
    }

    public showInfo(transform: Transform, text: string) {
        const aabb = transform.aabb;

        this.renderer.setText(this.infoText, text);
        this.renderer.setVisibility(this.infoText, true);
        this.renderer.transform(this.infoText, { x: aabb.right + 4, y: aabb.bottom + 24 });

        const bounds = this.renderer.getBounds(this.infoText);

        this.renderer.setText(this.infoRect, text);
        this.renderer.setVisibility(this.infoRect, true);
        this.renderer.transform(this.infoRect, { rect: bounds.inflate(4, 4) });
    }

    public reset() {
        for (let element of this.elements) {
            this.renderer.setVisibility(element, false);
        }
    }
}