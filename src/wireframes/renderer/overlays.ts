
import * as paper from 'paper';

import { Color, PaperHelper } from '@app/core';

import {
    SnapMode,
    SnapResult,
    Transform
} from '@app/wireframes/model';

export class Overlays {
    private textItem: paper.PointText;
    private rectItem: paper.Shape;
    private lineX: paper.Shape;
    private lineY: paper.Shape;
    private items: paper.Item[] = [];

    constructor(private readonly scope: paper.PaperScope, private readonly layer: paper.Layer) { }

    private ensureInfoShapes() {
        if (this.textItem) {
            return;
        }

        this.scope.activate();
        this.layer.activate();

        const rectItem = paper.Shape.Rectangle(PaperHelper.ZERO_POINT, PaperHelper.ZERO_SIZE);

        rectItem.fillColor = PaperHelper.COLOR_BLACK;
        rectItem.strokeColor = PaperHelper.COLOR_BLACK;
        rectItem.strokeWidth = 1;

        this.rectItem = rectItem;

        const textItem = new paper.PointText(PaperHelper.ZERO_POINT);

        textItem.fontSize = 12;
        textItem.fillColor = PaperHelper.COLOR_WHITE;

        this.textItem = textItem;

        this.items.push(this.textItem);
        this.items.push(this.rectItem);

        this.reset();
    }

    private ensureLines() {
        if (this.lineX && this.lineY) {
            return;
        }

        this.scope.activate();
        this.layer.activate();

        this.lineX = paper.Shape.Rectangle(new paper.Rectangle(0, 0, 0, 0));
        this.lineY = paper.Shape.Rectangle(new paper.Rectangle(0, 0, 0, 0));

        this.items.push(this.lineX);
        this.items.push(this.lineY);

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

        const h = this.scope.view.bounds.height;

        this.lineX.size = new paper.Size(1, h);
        this.lineX.fillColor = PaperHelper.toColor(color);
        this.lineX.position = new paper.Point(Math.round(value) + 0.5, h * 0.5);
        this.lineX.visible = true;
    }

    public showYLine(value: number, color: Color) {
        this.ensureLines();

        const w = this.scope.view.bounds.width;

        this.lineY.size = new paper.Size(w, 1);
        this.lineY.fillColor = PaperHelper.toColor(color);
        this.lineY.position = new paper.Point(w * 0.5, Math.round(value) + 0.5);
        this.lineY.visible = true;
    }

    public showInfo(transform: Transform, text: string) {
        this.ensureInfoShapes();

        const aabb = transform.aabb;

        this.ensureInfoShapes();

        this.textItem.content = text;
        this.textItem.point = new paper.Point(aabb.right + 4, aabb.bottom + 24);
        this.textItem.visible = true;

        const bounds = this.textItem.bounds;

        this.rectItem.position = bounds.center;
        this.rectItem.size =
            new paper.Size(
                bounds.size.width + 8,
                bounds.size.height + 8);
        this.rectItem.visible = true;
    }

    public reset() {
        for (let item of this.items) {
            item.visible = false;
        }
    }
}