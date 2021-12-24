/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

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

    it('should render rectangle', () => {
        render();

        expect(container.get(0).node.tagName).toEqual('rect');
    });

    it('should render same element', () => {
        render();
        const rendered1 = container.get(0);

        render();
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
            renderer.group(g => {
                g.rectangle(1);
            }, c => {
                c.rectangle(1);
                c.rectangle(1);
            });
        }).toThrowError();
    });

    function render() {
        renderer.setContainer(container);
        renderer.rectangle(1, 10, undefined);
        renderer.cleanupAll();
    }

    function renderWithBackground(color: string) {
        renderer.setContainer(container);
        renderer.rectangle(1, 10, undefined, p => {
            p.setBackgroundColor(color);
        });
        renderer.cleanupAll();
    }

    function renderConditional(condition: boolean) {
        renderer.setContainer(container);
        renderer.rectangle(1, 10);

        if (condition) {
            renderer.path(1, '');
        } else {
            renderer.ellipse(1);
        }

        renderer.rectangle(1, 10);
        renderer.cleanupAll();
    }

    function renderAdded(condition: boolean) {
        renderer.setContainer(container);
        renderer.rectangle(1, 10);

        if (condition) {
            renderer.ellipse(1);
            renderer.ellipse(1);
        } else {
            renderer.ellipse(1);
        }

        renderer.rectangle(1, 10);
        renderer.cleanupAll();
    }

    function renderWithClip(clip: boolean) {
        renderer.setContainer(container);
        renderer.group(g => {
            g.rectangle(1);
        }, c => {
            if (clip) {
                c.rectangle(1);
            }
        });
        renderer.cleanupAll();
    }
});
