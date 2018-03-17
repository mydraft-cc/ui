import { Rect2, Vec2 } from '@app/core';

import {
    Constraint,
    DiagramShape,
    Renderer
} from '@app/wireframes/model';

import { AbstractRenderer, PaperRenderer } from './paper-renderer';

const RENDER_BACKGROUND = 1;

export class AbstractContext {
    public readonly items: any[] = [];

    constructor(
        public readonly renderer: AbstractRenderer,
        public readonly shape: DiagramShape,
        public readonly bounds: Rect2
    ) {
    }

    public add(item: any) {
        this.items.push(item);
    }
}

const RENDERER = new PaperRenderer();

export abstract class AbstractControl implements Renderer {
    public static CONTROL_FONT_SIZE = 16;
    public static CONTROL_BACKGROUND_COLOR = 0xF0F0F0;
    public static CONTROL_BORDER_THICKNESS = 1;
    public static CONTROL_BORDER_COLOR = 0xc9c9c9;
    public static CONTROL_BORDER_RADIUS = 4;
    public static CONTROL_TEXT_COLOR = 0x252525;

    public abstract createDefaultShape(shapeId: string): DiagramShape;

    public abstract identifier(): string;

    public showInGallery() {
        return true;
    }

    public render(shape: DiagramShape, showDebugMarkers: boolean): any {
        const ctx = new AbstractContext(RENDERER, shape, new Rect2(Vec2.ZERO, shape.transform.size));

        if (RENDER_BACKGROUND) {
            const backgroundItem = ctx.renderer.createRoundedRectangle(ctx.bounds, 0, 0);

            ctx.renderer.setBackgroundColor(backgroundItem, 'transparent');

            ctx.add(backgroundItem);
        }

        this.renderInternal(ctx);

        if (showDebugMarkers) {
            const boxItem = ctx.renderer.createRoundedRectangle(ctx.bounds.inflate(1, 1), 1, 0);

            ctx.renderer.setStrokeColor(boxItem, 0xff0000);

            ctx.add(boxItem);
        }

        const rootItem = ctx.renderer.createGroup(...ctx.items);

        ctx.renderer.setPosition(rootItem, shape);
        ctx.renderer.setRotation(rootItem, shape);
        ctx.renderer.setOpacity(rootItem, shape);

        return rootItem;
    }

    protected abstract renderInternal(ctx: AbstractContext): void;
}

export class TextSizeConstraint implements Constraint {
    constructor(private readonly padding: number) { }

    public updateSize(shape: DiagramShape, size: Vec2): Vec2 {
        const fontSize = shape.appearance.get(DiagramShape.APPEARANCE_FONT_SIZE);

        const width =
            RENDERER.getTextWidth(
                shape.appearance.get(DiagramShape.APPEARANCE_TEXT), fontSize, 'sans serif');

        if (!width) {
            return size;
        }

        return new Vec2(width + this.padding * 2, fontSize * 1.2 + this.padding * 2).roundToMultipleOfTwo();
    }

    public calculateSizeX(): boolean {
        return true;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}