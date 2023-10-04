/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: '#fff',
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: 0,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'column1{strokeX=0};column2{strokeX=0};column3{strokeX=0}\nrow1{strokeX=0, strokeY=3};row1{strokeY=3, strokeX=0};row1{strokeY=3, strokeX=0}\nrow2{strokeX=0};merged row2{strokeX=0, spanX=2}',
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

    public render(ctx: RenderContext) {
        const w = ctx.rect.width;
        const h = ctx.rect.height;

        const { content, styles, columnCount } = this.parseText(ctx.shape);

        const cellWidth = w / columnCount;
        const cellHeight = h / content.length;

        this.createFrame(ctx);
        this.createBorders(ctx, content, columnCount, cellWidth, cellHeight, styles);
        this.createTexts(ctx, content, cellWidth, cellHeight, styles);
    }

    private createTexts(ctx: RenderContext, rows: string[][], cellWidth: number, cellHeight: number, styles: {}[][]) {
        let y = 0;

        for (let i = 0; i < rows.length; i++) {
            let x = 0;

            for (let j = 0; j < rows[i].length; j++) {
                const cell = rows[i][j];
                const factorWidth = ((styles[i][j]['spanX'] == null) || (styles[i][j]['spanX'] < 1)) ? 1 : styles[i][j]['spanX'];
                const rect = new Rect2(x, y, cellWidth * factorWidth, cellHeight);

                ctx.renderer2.text(ctx.shape, rect, p => {
                    p.setText(cell);
                    p.setForegroundColor(ctx.shape);
                });

                x += cellWidth;
            }

            y += cellHeight;
        }
    }

    private createBorders(ctx: RenderContext, rows: string[][], columnCount: number, cellWidth: number, cellHeight: number, styles: {}[][]) {
        const strokeColor = ctx.shape.getAppearance(DefaultAppearance.STROKE_COLOR);

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
                    p.setBackgroundColor(strokeColor);
                });

                // Horizontal
                const rectY = new Rect2(offsetX, offsetY, cellWidth, strokeY);
                ctx.renderer2.rectangle(0, 0, rectY, p => {
                    p.setBackgroundColor(strokeColor);
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
            record[part[0].trim()] = part[1].trim();
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

            while (content.length < 2) {
                content.push([]);
                styles.push([]);
            }

            // Add empty cell for spanning
            for (let i = 0; i < content.length; i++) {
                for (let j = 0; j < content[i].length; j++) {
                    const times = (styles[i][j]['spanX'] > 1) ? styles[i][j]['spanX'] - 1 : 0;
                    for (var k = 0; k < times; k++) {
                        content[i].splice(j + 1, 0, '');
                        styles[i].splice(j + 1, 0, { 'strokeX': 0, 'strokeY': styles[i][j]['strokeY'] });
                    }
                }
            }

            // Determine max number of columns
            let columnCount = 0;
            for (const i of content) {
                columnCount = Math.max(columnCount, i.length);
            }

            // Append blank cell in the end if not fulfill
            for (let i = 0; i < content.length; i++) {
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
