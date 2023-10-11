/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
// import { RendererService } from '@app/wireframes/model/renderer.service';
// import { AbstractControl } from '../utils/abstract-control';
import { CommonTheme } from './_theme';

const BORDER_TOP = 'BORDER_TOP';
const BORDER_DOWN = 'BORDER_DOWN';

const CELL_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0,
    [DefaultAppearance.STROKE_COLOR]: 0x000000,
    [DefaultAppearance.STROKE_THICKNESS]: 2,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Cell',
    [BORDER_TOP]: true,
    [BORDER_DOWN]: true,
};

export class Cell implements ShapePlugin {
    factorWidth = 1;

    public identifier(): string {
        return 'Cell';
    }

    public defaultAppearance() {
        return CELL_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 40 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.toggle(BORDER_TOP, 'Top Border'),
            factory.toggle(BORDER_DOWN, 'Bottom Border'),
        ];
    }

    public render(ctx: RenderContext) {

        this.createFrame(ctx);
        this.createText(ctx);

        if (ctx.shape.getAppearance(BORDER_TOP)) {
            this.createBorder(ctx, 0);
        }
        if (ctx.shape.getAppearance(BORDER_DOWN)) {
            this.createBorder(ctx, 1);
        }
    }

    private createFrame(ctx: RenderContext) {
        const rect = new Rect2(0, 0, ctx.rect.width * this.factorWidth, ctx.rect.height);

        ctx.renderer2.rectangle(ctx.shape, 0, rect, p => {
            p.setBackgroundColor(ctx.shape);
        });
    }

    private createBorder(ctx: RenderContext, index: number) {
        const strokeColor = ctx.shape.getAppearance(DefaultAppearance.STROKE_COLOR);
        const strokeWidth = ctx.shape.getAppearance(DefaultAppearance.STROKE_THICKNESS);
        const offset = Math.round(index * ctx.rect.height - strokeWidth * 0.5);

        const rect = new Rect2(0, offset, ctx.rect.width * this.factorWidth, strokeWidth);

        ctx.renderer2.rectangle(0, 0, rect, p => {
            p.setBackgroundColor(strokeColor);
        });
    }

    private createText(ctx: RenderContext) {
        const rect = new Rect2(0, 0, ctx.rect.width * this.factorWidth, ctx.rect.height);

        ctx.renderer2.text(ctx.shape, rect, p => {
            p.setForegroundColor(ctx.shape);
        });
    }
}

// export class Cells implements ShapePlugin {
//     public identifier(): string {
//         return 'Cells';
//     }

//     public defaultAppearance() {
//         return DEFAULT_APPEARANCE;
//     }

//     public defaultSize() {
//         return { x: 260, y: 200 };
//     }

//     public render(ctx: RenderContext) {
//         const { rows, columnCount } = this.parseText(ctx.shape);

//         const w = ctx.rect.width;
//         const h = ctx.rect.height;
//         const cellWidth = w / columnCount;
//         const cellHeight = h / rows.length;

//         for (let i = 0; i < rows.length; i++) {
//             for (let j = 0; j < rows[0].length; j++) {
//                 new Cell(rows[i][j], j * cellWidth, i * cellHeight, cellWidth, cellHeight, DEFAULT_APPEARANCE).render(ctx);
//             }
//         }
//     }
    
//     private parseText(shape: Shape) {
//         const key = shape.text;

//         let result = shape.renderCache['PARSED'] as { key: string; parsed: Parsed };

//         if (!result || result.key !== key) {
//             const rows = key.split('\n').map((x: string) => x.split(';').map((c: string) => c.trim()));

//             let columnCount = 0;

//             for (const row of rows) {
//                 columnCount = Math.max(columnCount, row.length);
//             }

//             while (rows.length < 2) {
//                 rows.push([]);
//             }

//             for (const row of rows) {
//                 while (row.length < columnCount) {
//                     row.push('');
//                 }
//             }

//             result = { parsed: { rows, columnCount }, key };

//             shape.renderCache['PARSED'] = result;
//         }

//         return result.parsed;
//     }
// }

// type Parsed = { rows: string[][]; columnCount: number };