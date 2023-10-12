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
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'column1{s1=2};column2{s1=2};column3{s1=2}\nrow1{s1=1};row1{s2=1};row1{s2=1}\nrow2{s2=2};merged row2{s1=0, s2=2, span=2}',
};

function parseParams(input: string) {
    var field = input.match(/\{(.*?)\}/);
    var params = (field == null) ? [] : field[0].replace(/\{/, '').replace(/\}/, '').split(',');
    var record = {};

    for (var i = 0; i < params.length; i++) {
        var part = params[i].split('=');
        record[part[0].trim()] = part[1].trim();
    }
    return record;
}

function parseContent(input: string) {
    var content = input.replace(/\{(.*?)\}/, '');
    return content;
}

export function parseTableText(text: string) {
    const content = text.split('\n').map(a => a.split(';').map(b => parseContent(b.trim())));
    const styles = text.split('\n').map(a => a.split(';').map(b => parseParams(b.trim())));

    while (content.length < 2) {
        content.push([]);
        styles.push([]);
    }

    // Add empty cell for spanning
    for (let i = 0; i < content.length; i++) {
        for (let j = 0; j < content[i].length; j++) {
            const times = (styles[i][j]['span'] > 1) ? styles[i][j]['span'] - 1 : 0;
            for (var k = 0; k < times; k++) {
                content[i].splice(j + 1, 0, '');
                styles[i].splice(j + 1, 0, { 's1': styles[i][j]['s1'], 's2': styles[i][j]['s2'] });
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

    return { content, styles, columnCount };
}

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
                const factorWidth = ((styles[i][j]['span'] == null) || (styles[i][j]['span'] < 1)) ? 1 : styles[i][j]['span'];
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
                const factorTop = (styles[y][x]['s1'] == null) ? 1 : styles[y][x]['s1'];
                const factorBot = (styles[y][x]['s2'] == null) ? 1 : styles[y][x]['s2'];
                const strokeTop = CommonTheme.CONTROL_BORDER_THICKNESS * factorTop;
                const strokeBot = CommonTheme.CONTROL_BORDER_THICKNESS * factorBot;
                const offsetX = Math.round(x * cellWidth);
                const offsetY = Math.round(y * cellHeight - strokeTop * 0.25 - strokeBot * 0.25);

                // Top
                const rectX = new Rect2(offsetX, offsetY, cellWidth, strokeTop);
                ctx.renderer2.rectangle(0, 0, rectX, p => {
                    p.setBackgroundColor(strokeColor);
                });

                // Bottom
                const rectY = new Rect2(offsetX, offsetY + cellHeight, cellWidth, strokeBot);
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

    private parseText(shape: Shape) {
        const key = shape.text;
    
        let result = shape.renderCache['PARSED'] as { key: string; parsed: Parsed };
    
        if (!result || result.key !== key) {
            const { content, styles, columnCount } = parseTableText(key);
    
            result = { parsed: { content, styles, columnCount }, key };
    
            shape.renderCache['PARSED'] = result;
        }
    
        return result.parsed;
    }
}

type Parsed = { content: string[][]; styles: {}[][]; columnCount: number };
