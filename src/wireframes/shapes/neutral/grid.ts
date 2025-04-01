/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_BACKGROUND_COLOR, SHAPE_TEXT_COLOR } from './ThemeShapeUtils';

const HEADER_BACKGROUND_COLOR = 'HEADER_BACKGROUND_COLOR';
const HEADER_FOREGROUND_COLOR = 'HEADER_FOREGROUND_COLOR';
const HEADER_HIDDEN = 'HEADER_HIDDEN';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: '#fff',
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'column1,column2,column3\nrow1,row1,row1\nrow2,row2',
    [HEADER_BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [HEADER_FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [HEADER_HIDDEN]: false,
};

export class Grid implements ShapePlugin {
    public identifier(): string {
        return 'Grid';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 260, y: 200 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.color(HEADER_BACKGROUND_COLOR, 'Header Background'),
            factory.color(HEADER_FOREGROUND_COLOR, 'Header Text'),
            factory.toggle(HEADER_HIDDEN, 'Hide Header'),
        ];
    }

    public render(ctx: RenderContext) {
        const w = ctx.rect.width;
        const h = ctx.rect.height;

        const { rows, columnCount } = this.parseText(ctx.shape);

        const cellWidth = w / columnCount;
        const cellHeight = h / rows.length;

        this.createFrame(ctx);
        this.createHeader(ctx, cellHeight);
        this.createBorders(ctx, columnCount, cellWidth, h, rows, cellHeight, w);
        this.createTexts(rows, cellWidth, cellHeight, ctx);
    }

    private createTexts(rows: string[][], cellWidth: number, cellHeight: number, ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : CommonTheme.CONTROL_TEXT_COLOR;
        const headerForegroundDefault = isDark ? 0xe0e0e0 : CommonTheme.CONTROL_TEXT_COLOR;
        let y = 0;

        // Get header foreground color accounting for dark mode
        let headerForeground = appearance.getAppearance(HEADER_FOREGROUND_COLOR);
        if (headerForeground === CommonTheme.CONTROL_TEXT_COLOR) {
            headerForeground = headerForegroundDefault;
        }

        for (const row of rows) {
            let x = 0;

            const isFirstRow = y === 0;

            for (const cell of row) {
                const rect = new Rect2(x, y, cellWidth, cellHeight);

                ctx.renderer2.text(ctx.shape, rect, p => {
                    p.setText(cell);

                    if (isFirstRow) {
                        p.setForegroundColor(headerForeground);
                    } else {
                        if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === CommonTheme.CONTROL_TEXT_COLOR) {
                            p.setForegroundColor(textColor);
                        } else {
                            p.setForegroundColor(ctx.shape);
                        }
                    }
                });

                x += cellWidth;
            }

            y += cellHeight;
        }
    }

    private createBorders(ctx: RenderContext, columnCount: number, cellWidth: number, h: number, rows: string[][], cellHeight: number, w: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const borderDefault = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        let stokeColor = appearance.getAppearance(DefaultAppearance.STROKE_COLOR);
        if (stokeColor === CommonTheme.CONTROL_BORDER_COLOR) {
            stokeColor = borderDefault;
        }
        
        const strokeWidth = ctx.shape.getAppearance(DefaultAppearance.STROKE_THICKNESS);
        const strokeHalf = strokeWidth * 0.5;

        for (let x = 1; x < columnCount; x++) {
            const offset = Math.round(x * cellWidth - strokeHalf);

            const rect = new Rect2(offset, 0, strokeWidth, h);

            ctx.renderer2.rectangle(0, 0, rect, p => {
                p.setBackgroundColor(stokeColor);
            });
        }

        for (let y = 2; y < rows.length; y++) {
            const offset = Math.round(y * cellHeight - strokeHalf);

            const rect = new Rect2(0, offset, w, strokeWidth);

            ctx.renderer2.rectangle(0, 0, rect, p => {
                p.setBackgroundColor(stokeColor);
            });
        }
    }

    private createHeader(ctx: RenderContext, height: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const borderDefault = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const headerBgDefault = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        const rect = new Rect2(ctx.rect.x, ctx.rect.y, ctx.rect.w, height);

        ctx.renderer2.roundedRectangleTop(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, rect, p => {
            if (!ctx.shape.getAppearance(HEADER_HIDDEN)) {
                const headerBg = appearance.getAppearance(HEADER_BACKGROUND_COLOR);
                if (headerBg === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                    p.setBackgroundColor(headerBgDefault);
                } else {
                    p.setBackgroundColor(headerBg);
                }
            }

            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(borderDefault);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }

    private createFrame(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const bgColor = isDark ? SHAPE_BACKGROUND_COLOR.DARK : 0xffffff;
        const borderDefault = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect, p => {
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === '#fff') {
                p.setBackgroundColor(bgColor);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
            
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(borderDefault);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }

    private parseText(shape: Shape) {
        const key = shape.text;

        let result = shape.renderCache['PARSED'] as { key: string; parsed: Parsed };

        if (!result || result.key !== key) {
            const rows = key.split('\n').map(x => x.split(',').map(c => c.trim()));

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
