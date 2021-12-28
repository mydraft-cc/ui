/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2 } from '@app/core';
import * as svg from '@svgdotjs/svg.js';
import { SVGRenderer2 } from './svg-renderer2';

describe('SVGRenderer2', () => {
    let renderer: SVGRenderer2;
    let container: svg.G;
    let root: svg.Svg;

    beforeEach(() => {
        root = svg.SVG().addTo(document.body);
        container = new svg.G().addTo(root);

        renderer = new SVGRenderer2();
        renderer.setContainer(container);
    });

    describe('Process', () => {
        it('should render same element', () => {
            renderRect();
            const rendered1 = container.get(0);

            renderRect();
            const rendered2 = container.get(0);

            expect(rendered2).toBe(rendered1);
            expect(container.children().length).toEqual(1);
        });

        it('should render same element with different colors', () => {
            renderWithBackground('#00ff00');
            const rendered1 = container.get(0);

            renderWithBackground('#ff0000');
            const rendered2 = container.get(0);

            expect(rendered2).toBe(rendered1);
            expect(rendered2.fill()).toEqual('#ff0000');
            expect(container.children().length).toEqual(1);
        });

        it('should reuse element when element changed', () => {
            renderConditional(true);
            const rendered1 = container.get(2);

            renderConditional(false);
            const rendered2 = container.get(2);

            expect(rendered2).toBe(rendered1);
            expect(container.children().length).toEqual(3);
        });

        it('should not reuse element when element added', () => {
            renderAdded(false);
            const rendered1 = container.get(2);

            renderAdded(true);
            const rendered2 = container.get(2);

            expect(rendered2).not.toBe(rendered1);
            expect(container.children().length).toEqual(4);
        });

        it('should remove old elements', () => {
            renderAdded(true);
            renderAdded(false);

            expect(container.children().length).toEqual(3);
        });

        it('should set clip element', () => {
            renderWithClip(true);
            const rendered = container.get(0) as svg.G;

            expect(rendered.clipper()).toBeDefined();
            expect(root.defs().children().length).toBe(1);
        });

        it('should unset clip element', () => {
            renderWithClip(true);
            const rendered1 = container.get(0) as svg.G;

            renderWithClip(false);
            const rendered2 = container.get(0) as svg.G;

            expect(rendered2).toBe(rendered1);
            expect(rendered2.clipper()).toBeNull();
            expect(root.defs().children().length).toBe(0);
        });

        it('should only allow one clip element', () => {
            expect(() => {
                render(r => {
                    r.group(g => {
                        g.rectangle(1);
                    }, c => {
                        c.rectangle(1);
                        c.rectangle(1);
                    });
                });
            }).toThrowError();
        });

        function renderRect() {
            render(r => {
                r.rectangle(1, 10, undefined);
            });
        }

        function renderWithBackground(color: string) {
            render(r => {
                r.rectangle(1, 10, undefined, p => {
                    p.setBackgroundColor(color);
                });
            });
        }

        function renderConditional(condition: boolean) {
            render(r => {
                r.rectangle(1, 10);

                if (condition) {
                    r.path(1, '');
                } else {
                    r.ellipse(1);
                }

                r.rectangle(1, 10);
            });
        }

        function renderAdded(condition: boolean) {
            render(r => {
                r.rectangle(1, 10);

                if (condition) {
                    r.ellipse(1);
                    r.ellipse(1);
                } else {
                    r.ellipse(1);
                }

                r.rectangle(1, 10);
            });
        }

        function renderWithClip(clip: boolean) {
            render(r => {
                r.group(g => {
                    g.rectangle(1);
                }, c => {
                    if (clip) {
                        c.rectangle(1);
                    }
                });
            });
        }
    });

    describe('Elements', () => {
        it('should render ellipse', () => {
            render(r => {
                r.ellipse(1);
            });

            expect(container.get(0).node.tagName).toEqual('ellipse');
        });

        it('should render path', () => {
            render(r => {
                r.path(1, 'M0,0 L10,10');
            });

            expect(container.get(0).node.tagName).toEqual('path');
        });

        it('should render raster', () => {
            render(r => {
                r.raster('source');
            });

            expect(container.get(0).node.tagName).toEqual('image');
        });

        it('should render rectangle', () => {
            render(r => {
                r.rectangle(1, 10, undefined);
            });

            expect(container.get(0).node.tagName).toEqual('rect');
        });

        it('should render rounded rectangle bottom', () => {
            render(r => {
                r.roundedRectangleBottom(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(container.get(0).node.tagName).toEqual('path');
        });

        it('should render rounded rectangle left', () => {
            render(r => {
                r.roundedRectangleLeft(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(container.get(0).node.tagName).toEqual('path');
        });

        it('should render rounded rectangle right', () => {
            render(r => {
                r.roundedRectangleRight(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(container.get(0).node.tagName).toEqual('path');
        });

        it('should render rounded rectangle top', () => {
            render(r => {
                r.roundedRectangleTop(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(container.get(0).node.tagName).toEqual('path');
        });

        it('should render text', () => {
            render(r => {
                r.text();
            });

            expect(container.get(0).node.tagName).toEqual('foreignObject');
        });

        it('should render multiline text', () => {
            render(r => {
                r.textMultiline();
            });

            expect(container.get(0).node.tagName).toEqual('foreignObject');
        });
    });

    describe('Properties', () => {
        it('should render background', () => {
            render(r => {
                r.rectangle(1, undefined, undefined, p => {
                    p.setBackgroundColor('#ff0000');
                });
            });

            expect(container.get(0).fill()).toEqual('#ff0000');
        });

        it('should render background from shape', () => {
            render(r => {
                r.rectangle(1, undefined, undefined, p => {
                    p.setBackgroundColor({ backgroundColor: '#ff0000', getAppearance: () => false } as any);
                });
            });

            expect(container.get(0).fill()).toEqual('#ff0000');
        });

        it('should render foreground color', () => {
            render(r => {
                r.rectangle(1, undefined, undefined, p => {
                    p.setForegroundColor('#00ff00');
                });
            });

            expect(container.get(0).attr('color')).toEqual('#00ff00');
        });

        it('should render foreground from shape', () => {
            render(r => {
                r.rectangle(1, undefined, undefined, p => {
                    p.setForegroundColor({ foregroundColor: '#00ff00', getAppearance: () => false } as any);
                });
            });

            expect(container.get(0).attr('color')).toEqual('#00ff00');
        });

        it('should render stroke color', () => {
            render(r => {
                r.rectangle(1, undefined, undefined, p => {
                    p.setStrokeColor('#0000ff');
                });
            });

            expect(container.get(0).stroke()).toEqual('#0000ff');
        });

        it('should render stroke color from shape', () => {
            render(r => {
                r.rectangle(1, undefined, undefined, p => {
                    p.setStrokeColor({ strokeColor: '#0000ff', getAppearance: () => false } as any);
                });
            });

            expect(container.get(0).stroke()).toEqual('#0000ff');
        });

        it('should render stroke style', () => {
            render(r => {
                r.rectangle(1, undefined, undefined, p => {
                    p.setStrokeStyle('rounded', 'squared');
                });
            });

            expect(container.get(0).attr('stroke-linecap')).toEqual('rounded');
            expect(container.get(0).attr('stroke-linejoin')).toEqual('squared');
        });

        it('should render font family', () => {
            render(r => {
                r.text(undefined, undefined, p => {
                    p.setFontFamily('Arial');
                });
            });

            expect((container.get(0).node.children[0] as HTMLDivElement).style.fontFamily).toEqual('Arial');
        });

        it('should render font family from shape', () => {
            render(r => {
                r.text(undefined, undefined, p => {
                    p.setFontFamily({ fontFamily: 'Arial', getAppearance: () => false } as any);
                });
            });

            expect((container.get(0).node.children[0] as HTMLDivElement).style.fontFamily).toEqual('Arial');
        });

        it('should render opacity', () => {
            render(r => {
                r.text(undefined, undefined, p => {
                    p.setOpacity(0.3);
                });
            });

            expect(container.get(0).opacity()).toEqual(0.3);
        });

        it('should render opacity from shape', () => {
            render(r => {
                r.text(undefined, undefined, p => {
                    p.setOpacity({ opacity: 0.3, getAppearance: () => false } as any);
                });
            });

            expect(container.get(0).opacity()).toEqual(0.3);
        });

        it('should render text', () => {
            render(r => {
                r.text(undefined, undefined, p => {
                    p.setText('Text');
                });
            });

            expect((container.get(0).node.children[0]).textContent).toEqual('Text');
        });

        it('should render text from shape', () => {
            render(r => {
                r.text(undefined, undefined, p => {
                    p.setText({ text: 'Text', getAppearance: () => false } as any);
                });
            });

            expect((container.get(0).node.children[0]).textContent).toEqual('Text');
        });
    });

    function render(action: (renderer: SVGRenderer2) => void) {
        renderer.setContainer(container);
        action(renderer);
        renderer.cleanupAll();
    }
});
