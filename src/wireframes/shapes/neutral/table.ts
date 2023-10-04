/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

// const CELL_STROKE_COLOR = 'STROKE_COLOR';
// const CELL_STROKE_THICKNESS = 'STROKE_THICKNESS';
// const CELL_STROKES_UP = 'CELL_STROKES_UP';
// const CELL_STROKES_DOWN = 'CELL_STROKES_DOWN';
// const CELL_STROKES_LEFT = 'CELL_STROKES_LEFT';
// const CELL_STROKES_RIGHT = 'CELL_STROKES_RIGHT';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: '#fff',
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: 0,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'column1{strokeX=0};column2{strokeX=0};column3{strokeX=0}\nrow1{strokeX=0,strokeY=2};row1{strokeY=2,strokeX=0};row1{strokeY=2,strokeX=0}\nrow2{strokeX=0};row2{strokeX=0}',
    // [CELL_STROKES_UP]: true,
    // [CELL_STROKES_DOWN]: true,
    // [CELL_STROKES_LEFT]: true,
    // [CELL_STROKES_RIGHT]: true,
};

export class Table implements ShapePlugin {
    public identifier(): string {
        return 'Table';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 260, y: 200 };
    }

    // public configurables(factory: ConfigurableFactory) {
    //     return [
    //         factory.toggle(CELL_STROKES_LEFT, 'Left Stroke'),
    //         factory.toggle(CELL_STROKES_RIGHT, 'Right Stroke'),
    //         factory.toggle(CELL_STROKES_UP, 'Top Stroke'),
    //         factory.toggle(CELL_STROKES_DOWN, 'Down Stroke'),
    //     ];
    // }

    public render(ctx: RenderContext) {
        const w = ctx.rect.width;
        const h = ctx.rect.height;

        const { content, styles, columnCount } = this.parseText(ctx.shape);

        const cellWidth = w / columnCount;
        const cellHeight = h / content.length;

        this.createFrame(ctx);
        this.createBorders(ctx, columnCount, cellWidth, h, content, styles, cellHeight, w);
        this.createTexts(content, cellWidth, cellHeight, ctx);
    }

    private createTexts(rows: string[][], cellWidth: number, cellHeight: number, ctx: RenderContext) {
        let y = 0;

        for (const row of rows) {
            let x = 0;

            for (const cell of row) {
                const rect = new Rect2(x, y, cellWidth, cellHeight);

                ctx.renderer2.text(ctx.shape, rect, p => {
                    p.setText(cell);
                    p.setForegroundColor(ctx.shape);
                });

                x += cellWidth;
            }

            y += cellHeight;
        }
    }

    private createBorders(ctx: RenderContext, columnCount: number, cellWidth: number, h: number, rows: string[][], styles: {}[][], cellHeight: number, w: number) {
        const stokeColor = ctx.shape.getAppearance(DefaultAppearance.STROKE_COLOR);

        for (let x = 0; x < columnCount; x++) {
            for (let y = 0; y < rows.length; y++) {
                const factorX = (styles[y][x]['strokeX'] == null) ? 1 : styles[y][x]['strokeX'];
                const factorY = (styles[y][x]['strokeY'] == null) ? 1 : styles[y][x]['strokeY'];
                const strokeX = CommonTheme.CONTROL_BORDER_THICKNESS * factorX;
                const strokeY = CommonTheme.CONTROL_BORDER_THICKNESS * factorY;
                const offsetX = Math.round(x * cellWidth - strokeX * 0.5);
                const offsetY = Math.round(y * cellHeight - strokeY * 0.5);

                // Vertical
                const rectX = new Rect2(offsetX, offsetY, strokeX, cellHeight);
                ctx.renderer2.rectangle(0, 0, rectX, p => {
                    p.setBackgroundColor(stokeColor);
                });

                // Horizontal
                const rectY = new Rect2(offsetX, offsetY, cellWidth, strokeY);
                ctx.renderer2.rectangle(0, 0, rectY, p => {
                    p.setBackgroundColor(stokeColor);
                });
            }
        }
    }

    private createFrame(ctx: RenderContext) {
        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape);
            p.setStrokeColor(ctx.shape);
        });
    }

    private parseParams(input: string) {
        var field = input.match(/\{(.*?)\}/);
        var params = (field == null) ? [] : field[0].replace(/\{/, '').replace(/\}/, '').split(',');
        var record = {};

        for (var i = 0; i < params.length; i++) {
            var part = params[i].split('=');
            record[part[0]] = part[1];
        }
        return record;
    }

    private parseContent(input: string) {
        var content = input.replace(/\{(.*?)\}/, '');
        return content;
    }

    private parseText(shape: Shape) {
        const key = shape.text;

        let result = shape.renderCache['PARSED'] as { key: string; parsed: Parsed };

        if (!result || result.key !== key) {
            const content = key.split('\n').map(a => a.split(';').map(b => this.parseContent(b.trim())));
            const styles = key.split('\n').map(a => a.split(';').map(b => this.parseParams(b.trim())));

            let columnCount = 0;

            for (const i of content) {
                columnCount = Math.max(columnCount, i.length);
            }

            while (content.length < 2) {
                content.push([]);
                styles.push([]);
            }

            for (var i = 0; i < content.length; i++) {
                while (content[i].length < columnCount) {
                    content[i].push('');
                    styles[i].push({});
                }
            }

            result = { parsed: { content, styles, columnCount }, key };

            shape.renderCache['PARSED'] = result;
        }

        return result.parsed;
    }
}

type Parsed = { content: string[][]; styles: {}[][]; columnCount: number };
