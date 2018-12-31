import * as svg from 'svg.js';

import { Color } from '@app/core';

import {
    SnapMode,
    SnapResult,
    Transform
} from '@app/wireframes/model';

import { SVGRenderer } from '@app/wireframes/shapes/utils/svg-renderer';

export class InteractionOverlays {
    private readonly infoRect: any;
    private readonly infoText: any;
    private readonly lineX: any;
    private readonly lineY: any;
    private readonly elements: any[] = [];
    private readonly renderer: SVGRenderer;

    constructor(
       layer: svg.Container
    ) {
        this.renderer = new SVGRenderer();
        this.renderer.captureContext(layer);

        this.lineX = this.renderer.createRectangle(0);
        this.lineY = this.renderer.createRectangle(0);

        this.elements.push(this.lineX);
        this.elements.push(this.lineY);

        this.infoRect = this.renderer.createRectangle(0);
        this.infoText = this.renderer.createSinglelineText({ text: '', fontSize: 14 });

        this.elements.push(this.infoRect);
        this.elements.push(this.infoText);

        this.renderer.setBackgroundColor(this.infoRect, '#000');
        this.renderer.setForegroundColor(this.infoText, '#fff');
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
        this.renderer.setBackgroundColor(this.lineX, color);
        this.renderer.setTransform(this.lineX, { x: value, y: -4000, w: 1, h: 10000 });
        this.renderer.setVisibility(this.lineX, true);
    }

    public showYLine(value: number, color: Color) {
        this.renderer.setBackgroundColor(this.lineY, color);
        this.renderer.setTransform(this.lineY, { x: -4000, y: value, w: 10000, h: 1 });
        this.renderer.setVisibility(this.lineY, true);
    }

    public showInfo(transform: Transform, text: string) {
        const aabb = transform.aabb;

        this.renderer.setText(this.infoText, text);
        this.renderer.setTransform(this.infoText, { x: aabb.right + 4, y: aabb.bottom + 24, w: 160, h: 24 });
        this.renderer.setVisibility(this.infoText, true);

        const bounds = this.renderer.getBounds(this.infoText);

        this.renderer.setTransform(this.infoRect, { rect: bounds.inflate(4) });
        this.renderer.setVisibility(this.infoRect, true);
    }

    public reset() {
        for (let element of this.elements) {
            this.renderer.setVisibility(element, false);
        }
    }
}