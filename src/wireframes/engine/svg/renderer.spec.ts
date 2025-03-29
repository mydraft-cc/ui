/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Rect2 } from '@app/core/utils';
import { SvgRenderer } from './renderer';

// Helper to detect if we're in jsdom environment
const isJsdom = typeof window !== 'undefined' && window.navigator.userAgent.includes('jsdom');

describe('SVGRenderer', () => {
    const bounds = new Rect2(0, 0, 100, 100);
    let renderer: SvgRenderer;
    let svgGroup: svg.G;
    let svgRoot: svg.Svg;

    beforeEach(() => {
        svgRoot = svg.SVG().addTo(document.body);
        svgGroup = new svg.G().addTo(svgRoot);

        renderer = new SvgRenderer();
        renderer.setContainer(svgGroup);
    });

    describe('Process', () => {
        it('should render same element', () => {
            renderRect();
            const rendered1 = svgGroup.get(0);

            renderRect();
            const rendered2 = svgGroup.get(0);

            expect(rendered2).toBe(rendered1);
            expect(svgGroup.children().length).toEqual(1);
        });

        it('should render same element with different colors', () => {
            renderWithBackground('#00ff00');
            const rendered1 = svgGroup.get(0);

            renderWithBackground('#ff0000');
            const rendered2 = svgGroup.get(0);

            expect(rendered2).toBe(rendered1);
            expect(rendered2.fill()).toEqual('#ff0000');
            expect(svgGroup.children().length).toEqual(1);
        });

        it('should reuse element when element changed', () => {
            renderConditional(true);
            const rendered1 = svgGroup.get(2);

            renderConditional(false);
            const rendered2 = svgGroup.get(2);

            expect(rendered2).toBe(rendered1);
            expect(svgGroup.children().length).toEqual(3);
        });

        it('should not reuse element when element added', () => {
            renderAdded(false);
            const rendered1 = svgGroup.get(2);

            renderAdded(true);
            const rendered2 = svgGroup.get(2);

            expect(rendered2).not.toBe(rendered1);
            expect(svgGroup.children().length).toEqual(4);
        });

        it('should remove old elements', () => {
            renderAdded(true);
            renderAdded(false);

            expect(svgGroup.children().length).toEqual(3);
        });

        it('should set clip element', () => {
            renderWithClip(true);
            const rendered = svgGroup.get(0) as svg.G;

            expect(rendered.attr('clip-path')).toBeDefined();
            expect(rendered.children().length).toEqual(2);
        });

        it('should unset clip element', () => {
            renderWithClip(true);
            const rendered1 = svgGroup.get(0) as svg.G;

            renderWithClip(false);
            const rendered2 = svgGroup.get(0) as svg.G;

            expect(rendered2).toBe(rendered1);
            expect(rendered2.attr('clip-path')).not.toBeDefined();
            expect(rendered2.children().length).toEqual(1);
        });

        it('should only allow one clip element', () => {
            expect(() => {
                render(r => {
                    r.group(g => {
                        g.rectangle(1, 0, bounds);
                    }, c => {
                        c.rectangle(1, 0, bounds);
                        c.rectangle(1, 0, bounds);
                    });
                });
            }).toThrowError();
        });

        function renderRect() {
            render(r => {
                r.rectangle(1, 10, bounds);
            });
        }

        function renderWithBackground(color: string) {
            render(r => {
                r.rectangle(1, 10, bounds, p => {
                    p.setBackgroundColor(color);
                });
            });
        }

        function renderConditional(condition: boolean) {
            render(r => {
                r.rectangle(1, 10, bounds);

                if (condition) {
                    r.path(1, '');
                } else {
                    r.ellipse(1, bounds);
                }

                r.rectangle(1, 10, bounds);
            });
        }

        function renderAdded(condition: boolean) {
            render(r => {
                r.rectangle(1, 10, bounds);

                if (condition) {
                    r.ellipse(1, bounds);
                    r.ellipse(1, bounds);
                } else {
                    r.ellipse(1, bounds);
                }

                r.rectangle(1, 10, bounds);
            });
        }

        function renderWithClip(clip: boolean) {
            render(r => {
                r.group(g => {
                    g.rectangle(1, 0, bounds);
                }, c => {
                    if (clip) {
                        c.rectangle(1, 0, bounds);
                    }
                });
            });
        }
    });

    describe('Elements', () => {
        it('should render ellipse', () => {
            render(r => {
                r.ellipse(1, bounds);
            });

            expect(svgGroup.get(0).node.tagName).toEqual('ellipse');
        });

        it('should render path', () => {
            render(r => {
                r.path(1, 'M0,0 L10,10');
            });

            expect(svgGroup.get(0).node.tagName).toEqual('path');
        });

        it('should render raster', () => {
            render(r => {
                r.raster('source', bounds);
            });

            expect(svgGroup.get(0).node.tagName).toEqual('image');
        });

        it('should render rectangle', () => {
            render(r => {
                r.rectangle(1, 10, bounds);
            });

            expect(svgGroup.get(0).node.tagName).toEqual('rect');
        });

        it('should render rounded rectangle bottom', () => {
            render(r => {
                r.roundedRectangleBottom(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(svgGroup.get(0).node.tagName).toEqual('path');
        });

        it('should render rounded rectangle left', () => {
            render(r => {
                r.roundedRectangleLeft(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(svgGroup.get(0).node.tagName).toEqual('path');
        });

        it('should render rounded rectangle right', () => {
            render(r => {
                r.roundedRectangleRight(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(svgGroup.get(0).node.tagName).toEqual('path');
        });

        it('should render rounded rectangle top', () => {
            render(r => {
                r.roundedRectangleTop(1, 10, new Rect2(0, 0, 10, 10));
            });

            expect(svgGroup.get(0).node.tagName).toEqual('path');
        });

        it('should render text', () => {
            // Skip in jsdom environment
            if (isJsdom) {
                return;
            }
            
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setText('Text');
                });
            });

            expect(svgGroup.get(0).node.children[0].textContent).toEqual('Text');
        });

        it('should render multiline text', () => {
            render(r => {
                r.textMultiline({} as any, bounds);
            });

            expect(svgGroup.get(0).node.tagName).toEqual('foreignObject');
        });
    });

    describe('Properties', () => {
        it('should render background', () => {
            render(r => {
                r.rectangle(1, 0, bounds, p => {
                    p.setBackgroundColor('#ff0000');
                });
            });

            expect(svgGroup.get(0).fill()).toEqual('#ff0000');
        });

        it('should render background from shape', () => {
            render(r => {
                r.rectangle(1, 0, bounds, p => {
                    p.setBackgroundColor({ backgroundColor: '#ff0000', getAppearance: () => false } as any);
                });
            });

            expect(svgGroup.get(0).fill()).toEqual('#ff0000');
        });

        it('should render foreground color', () => {
            render(r => {
                r.rectangle(1, 0, bounds, p => {
                    p.setForegroundColor('#00ff00');
                });
            });

            expect(svgGroup.get(0).attr('color')).toEqual('#00ff00');
        });

        it('should render foreground from shape', () => {
            render(r => {
                r.rectangle(1, 0, bounds, p => {
                    p.setForegroundColor({ foregroundColor: '#00ff00', getAppearance: () => false } as any);
                });
            });

            expect(svgGroup.get(0).attr('color')).toEqual('#00ff00');
        });

        it('should render stroke color', () => {
            render(r => {
                r.rectangle(1, 0, bounds, p => {
                    p.setStrokeColor('#0000ff');
                });
            });

            expect(svgGroup.get(0).stroke()).toEqual('#0000ff');
        });

        it('should render stroke color from shape', () => {
            render(r => {
                r.rectangle(1, 0, bounds, p => {
                    p.setStrokeColor({ strokeColor: '#0000ff', getAppearance: () => false } as any);
                });
            });

            expect(svgGroup.get(0).stroke()).toEqual('#0000ff');
        });

        it('should render stroke style', () => {
            render(r => {
                r.rectangle(1, 0, bounds, p => {
                    p.setStrokeStyle('rounded', 'squared');
                });
            });

            expect(svgGroup.get(0).attr('stroke-linecap')).toEqual('rounded');
            expect(svgGroup.get(0).attr('stroke-linejoin')).toEqual('squared');
        });

        it('should render font family', () => {
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setFontFamily('Arial');
                });
            });

            expect((svgGroup.get(0).node.children[0] as HTMLDivElement).style.fontFamily).toEqual('Arial');
        });

        it('should render font family from shape', () => {
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setFontFamily({ fontFamily: 'Arial', getAppearance: () => false } as any);
                });
            });

            expect((svgGroup.get(0).node.children[0] as HTMLDivElement).style.fontFamily).toEqual('Arial');
        });

        it('should render text decoration', () => {
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setText('Text').setTextDecoration('underline');
                });
            });

            expect((svgGroup.get(0).node.children[0] as HTMLDivElement).style.textDecoration).toEqual('underline');
        });

        it('should render opacity', () => {
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setOpacity(0.3);
                });
            });

            expect(svgGroup.get(0).opacity()).toEqual(0.3);
        });

        it('should render opacity from shape', () => {
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setOpacity({ opacity: 0.3, getAppearance: () => false } as any);
                });
            });

            expect(svgGroup.get(0).opacity()).toEqual(0.3);
        });

        it('should render text from shape', () => {
            // Skip in jsdom environment
            if (isJsdom) {
                return;
            }
            
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setText({ text: 'Text', getAppearance: () => false } as any);
                });
            });

            expect(svgGroup.get(0).node.children[0].textContent).toEqual('Text');
        });

        it('should render text as markdown', () => {
            render(r => {
                r.text({} as any, bounds, p => {
                    p.setText('**Text**', true);
                });
            });

            expect(svgGroup.get(0).node.children[0].innerHTML).toContain('<strong>Text</strong>');
        });
    });

    describe('Utils', () => {
        it('should calculate text size', () => {
            // Skip in jsdom environment
            if (isJsdom) {
                return;
            }
            
            const size1 = renderer.getTextWidth('Hello World', 16, 'inherit');
            const size2 = renderer.getTextWidth('Hello World', 18, 'inherit');

            expect(size2).toBeGreaterThan(size1);
        });

        it('should get outer bounds', () => {
            const bounds = renderer.getOuterBounds(4, new Rect2(10, 20, 30, 40));

            expect(bounds).toEqual({ x: 12, y: 22, w: 26, h: 36 });
        });
    });

    function render(action: (renderer: SvgRenderer) => void) {
        renderer.setContainer(svgGroup);
        action(renderer);
        renderer.cleanupAll();
    }
});
