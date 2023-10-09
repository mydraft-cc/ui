/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const BORDER_TOP = 'BORDER_TOP';
const BORDER_DOWN = 'BORDER_DOWN';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0,
    [DefaultAppearance.STROKE_COLOR]: 0x000000,
    [DefaultAppearance.STROKE_THICKNESS]: 2,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Cell 1;Cell 2\nCell 3',
    [BORDER_TOP]: true,
    [BORDER_DOWN]: false,
};

export class Cell implements ShapePlugin {
    public identifier(): string {
        return 'Cell';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 260, y: 200 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.toggle(BORDER_TOP, 'Top Border'),
            factory.toggle(BORDER_DOWN, 'Bottom Border'),
        ];
    }

    public render(ctx: RenderContext) {
        const { rows, columnCount } = this.parseText(ctx.shape);

        const w = ctx.rect.width;
        const h = ctx.rect.height;
        const cellWidth = w / columnCount;
        const cellHeight = h / rows.length;

        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < rows[0].length; j++) {
                this.renderCell(ctx, rows[i][j], j * cellWidth, i * cellHeight, cellWidth, 1, cellHeight);
            }
        }
    }

    private renderCell(ctx: RenderContext, text: string, x: number, y: number, cellWidth: number, factorWidth: number, cellHeight: number) {
        this.createFrame(ctx, x, y, cellWidth, factorWidth, cellHeight);
        this.createText(ctx, text, x, y, cellWidth, factorWidth, cellHeight);

        if (ctx.shape.getAppearance(BORDER_TOP)) {
            this.createBorder(ctx, 0, x, y, cellWidth, factorWidth, cellHeight);
        }
        if (ctx.shape.getAppearance(BORDER_DOWN)) {
            this.createBorder(ctx, 1, x, y, cellWidth, factorWidth, cellHeight);
        }
    }

    private createFrame(ctx: RenderContext, x: number, y: number, cellWidth: number, factorWidth: number, cellHeight: number) {
        const rect = new Rect2(x, y, cellWidth * factorWidth, cellHeight);

        ctx.renderer2.rectangle(ctx.shape, 0, rect, p => {
            p.setBackgroundColor(ctx.shape);
        });
    }

    private createBorder(ctx: RenderContext, index: number, x: number, y: number, cellWidth: number, factorWidth: number, cellHeight: number) {
        const strokeColor = ctx.shape.getAppearance(DefaultAppearance.STROKE_COLOR);
        const strokeWidth = ctx.shape.getAppearance(DefaultAppearance.STROKE_THICKNESS);
        const strokeHalf = strokeWidth * 0.5;
        const offset = Math.round(index * cellHeight - strokeHalf);

        const rect = new Rect2(x, y + offset, cellWidth * factorWidth, strokeWidth);

        ctx.renderer2.rectangle(0, 0, rect, p => {
            p.setBackgroundColor(strokeColor);
        });
    }

    private createText(ctx: RenderContext, text: string, x: number, y: number, cellWidth: number, factorWidth: number, cellHeight: number) {
        const rect = new Rect2(x, y, cellWidth * factorWidth, cellHeight);

        ctx.renderer2.text(ctx.shape, rect, p => {
            p.setText(text);
            p.setForegroundColor(ctx.shape);
        });
    }
    
    private parseText(shape: Shape) {
        const key = shape.text;

        let result = shape.renderCache['PARSED'] as { key: string; parsed: Parsed };

        if (!result || result.key !== key) {
            const rows = key.split('\n').map((x: string) => x.split(';').map((c: string) => c.trim()));

            let columnCount = 0;

            for (const row of rows) {
                columnCount = Math.max(columnCount, row.length);
            }

            while (rows.length < 2) {
                rows.push([]);
            }

            for (const row of rows) {
                while (row.length < columnCount) {
                    row.push('');
                }
            }

            result = { parsed: { rows, columnCount }, key };

            shape.renderCache['PARSED'] = result;
        }

        return result.parsed;
    }
}

type Parsed = { rows: string[][]; columnCount: number };