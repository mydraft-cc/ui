/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Meta } from '@storybook/react';
import { Card, Col, Row } from 'antd';
import * as React from 'react';
import { Color, Rect2, Rotation, Vec2 } from '@app/core';
import { RenderContext, ShapeRenderer } from '@app/wireframes/interface';
import { DefaultConstraintFactory, DiagramItem, Transform } from '@app/wireframes/model';
import { Checkbox } from '../shapes/dependencies';
import { CanvasProps } from './canvas';
import { Engine } from './interface';
import { PixiCanvasView } from './pixi/canvas/PixiCanvas';
import { SvgCanvasView } from './svg/canvas/SvgCanvas';

const VIEWBOX = { minX: 0, minY: 0, maxX: 600, maxY: 600, zoom: 1 };

const LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const LOREM_SHORT = 'Lorem ipsum';

class DummyPlugin {
    constructor(
        private readonly renderer: (renderer: ShapeRenderer, width: number, color: string) => void,
        private readonly width: number,
        private readonly color: string,
    ) {
    }

    public render(ctx: RenderContext) {
        this.renderer(ctx.renderer2, this.width, this.color);
    }
}

interface EngineProps {
    // The render function.
    onRender: (renderer: ShapeRenderer, width: number, color: string) => void;

    // True to rotate.
    rotate?: boolean;

    // The number of iterations.
    iterations?: number;
}

const EngineCanvas = (props: EngineProps & { canvasView: React.ComponentType<CanvasProps> }) => {
    const [engine, setEngine] = React.useState<Engine>();
    const { iterations, onRender, rotate } = props;

    React.useEffect(() => {
        if (engine) {
            const layer = engine.layer('default');
            const itemCount = iterations || 10;
            const itemHeight = 50;

            for (let i = 0; i < itemCount; i++) {    
                const color = Color.fromHsv((360 / itemCount) * i, 1, 0.75);

                const item = layer.item(new DummyPlugin(onRender, i, color.toString()) as any);
                item.plot(
                    DiagramItem.createShape({ 
                        renderer: 'none',
                        transform: new Transform(
                            new Vec2(100, 50 + i * itemHeight), 
                            new Vec2(100, itemHeight),
                            rotate ? 
                                Rotation.fromDegree(i * 10) :
                                Rotation.ZERO),
                    }));

            }
        }
    }, [engine, iterations, onRender, rotate]);

    return (
        <div style={{ lineHeight: 0 }}>
            <props.canvasView style={{ height: '600px', width: '600px' }} viewBox={VIEWBOX} onInit={setEngine} />
        </div>
    );
};

const CheckboxCanvas = (props: { canvasView: React.ComponentType<CanvasProps> }) => {
    const [engine, setEngine] = React.useState<Engine>();

    React.useEffect(() => {
        if (engine) {
            const plugin = new Checkbox();

            const item = engine.layer('default').item(plugin);
            const size = plugin.defaultSize();
            const shape =
                DiagramItem.createShape({
                    renderer: plugin.identifier(),
                    transform: new Transform(
                        new Vec2(0.5 * size.x, 0.5 * size.y),
                        new Vec2(size.x, size.y),
                        Rotation.ZERO),
                    appearance: { ...plugin.defaultAppearance(), STATE: 'Checked' },
                    configurables: [],
                    constraint: plugin?.constraint?.(DefaultConstraintFactory.INSTANCE),
                });

            item.plot(shape);
        }
    }, [engine]);

    return (
        <div style={{ lineHeight: 0 }}>
            <props.canvasView style={{ height: '600px', width: '600px' }} viewBox={VIEWBOX} onInit={setEngine} />
        </div>
    );
};

const CompareView = (props: EngineProps) => {
    return (
        <Row gutter={16}>
            <Col span={12}>
                <Card title='SVG' style={{ overflow: 'hidden' }}>
                    <EngineCanvas canvasView={SvgCanvasView} {...props} />
                </Card>
            </Col>
            <Col span={12}>
                <Card title='PIXI' style={{ overflow: 'hidden' }}>
                    <EngineCanvas canvasView={PixiCanvasView as any} {...props} />
                </Card>
            </Col>
        </Row>
    );
};

const CheckboxCompareView = () => {
    return (
        <Row gutter={16}>
            <Col span={12}>
                <Card title='SVG' style={{ overflow: 'hidden' }}>
                    <CheckboxCanvas canvasView={SvgCanvasView} />
                </Card>
            </Col>
            <Col span={12}>
                <Card title='PIXI' style={{ overflow: 'hidden' }}>
                    <CheckboxCanvas canvasView={PixiCanvasView as any} />
                </Card>
            </Col>
        </Row>
    );
};

export default {
    component: CompareView,
} as Meta<typeof EngineCanvas>;

export const Complex = () => {
    return (
        <CheckboxCompareView />
    );
};

export const Rect = () => {
    return (
        <CompareView
            onRender={(renderer, strokeWidth, color) =>
                renderer.rectangle(strokeWidth, 0, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RotatedRect = () => {
    return (
        <CompareView
            rotate={true}
            onRender={(renderer, strokeWidth, color) =>
                renderer.rectangle(strokeWidth, 0, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectLeft = () => {
    return (
        <CompareView
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleLeft(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectRight = () => {
    return (
        <CompareView
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleRight(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectTop = () => {
    return (
        <CompareView
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleTop(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectBottom = () => {
    return (
        <CompareView
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleBottom(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const Ellipse = () => {
    return (
        <CompareView
            onRender={(renderer, strokeWidth, color) =>
                renderer.ellipse(strokeWidth, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const TextCenter = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: LOREM_SHORT, alignment: 'center' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TextCenterOffset = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(50, 50, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: LOREM_SHORT, alignment: 'center' }, new Rect2(50, 50, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TextColored = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: LOREM_SHORT, alignment: 'center' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setForegroundColor('red')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TextUnderline = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: 'Link', alignment: 'center' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color)
                        .setTextDecoration('underline'),
                    );
                })
            }
        />
    );
};

export const TextMarkdown = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: 'This is **bold**', alignment: 'center' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    true,
                    );
                })
            }
        />
    );
};

export const TextLeft = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: LOREM_SHORT, alignment: 'left' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TextRight = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: LOREM_SHORT, alignment: 'right' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TruncatedText = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: LOREM_IPSUM }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TruncatedTextRight = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: LOREM_IPSUM, alignment: 'right' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const MultilineText = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.textMultiline({ text: LOREM_IPSUM }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const MultilineTextWide = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 300, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.textMultiline({ text: LOREM_IPSUM }, new Rect2(0, 0, 300, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const MultilineTextRight = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 300, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.textMultiline({ text: LOREM_IPSUM, alignment: 'right' }, new Rect2(0, 0, 300, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const MultilineTextRightShort = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 300, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.textMultiline({ text: LOREM_SHORT, alignment: 'right' }, new Rect2(0, 0, 300, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const Raster = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer) => 
                renderer.group(i => {
                    i.raster('https://picsum.photos/id/58/200/300', new Rect2(0, 0, 100, 100), false);
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 100), p => p
                        .setStrokeColor('black'),
                    );
                })
            }
        />
    );
};

export const RasterAspectRatioWidth = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer) => 
                renderer.group(i => {
                    i.raster('https://picsum.photos/id/58/400/100', new Rect2(0, 0, 100, 100), true);
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 100), p => p
                        .setStrokeColor('black'),
                    );
                })
            } 
        />
    );
};

export const RasterAspectRatioHeight = () => {
    return (
        <CompareView
            iterations={1}
            onRender={(renderer) => 
                renderer.group(i => {
                    i.raster('https://picsum.photos/id/58/100/400', new Rect2(0, 0, 100, 100), true);
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 100), p => p
                        .setStrokeColor('black'),
                    );
                })
            } 
        />
    );
};