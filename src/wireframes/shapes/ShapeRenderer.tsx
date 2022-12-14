/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { SVGHelper, Vec2 } from '@app/core';
import { ShapePlugin } from '@app/wireframes/interface';
import { DiagramItem } from '@app/wireframes/model';
import { AbstractControl } from './utils/abstract-control';

interface ShapeRendererProps {
    plugin: ShapePlugin;

    // The optional appearance.
    appearance?: { [key: string]: any };

    // The desired width.
    desiredWidth?: number;
    
    // The desired height.
    desiredHeight?: number;

    // True to use the preview size
    usePreviewSize?: boolean;

    // True to use the preview offset.
    usePreviewOffset?: boolean;
}

export const ShapeRenderer = React.memo(React.forwardRef<HTMLDivElement, ShapeRendererProps>((props, ref) => {
    const { 
        appearance,
        desiredHeight,
        desiredWidth,
        plugin, 
        usePreviewOffset,
        usePreviewSize, 
    } = props;

    const [document, setDocument] = React.useState<svg.Svg>();
    const innerRef = React.useRef<SVGSVGElement>(null);

    const viewBox = getViewBox(plugin, 
        desiredWidth,
        desiredHeight,
        usePreviewSize,
        usePreviewOffset);

    React.useEffect(() => {
        if (!innerRef.current) {
            return;
        }

        setDocument(svg.SVG(innerRef.current!).css({ overflow: 'visible' }));
    }, []);

    React.useEffect(() => {
        if (!document) {
            return;
        }

        document.viewbox(viewBox.x, viewBox.y, viewBox.outerSize.x, viewBox.outerSize.y);
    }, [document, viewBox]);

    React.useEffect(() => {
        if (!document) {
            return;
        }

        if (desiredWidth && desiredHeight) {
            let aspectRatio = viewBox.outerSize.x / viewBox.outerSize.y;
        
            if (aspectRatio > desiredWidth / desiredHeight) {
                document.width(desiredWidth);
            } else {
                document.height(desiredHeight);
            }
        } else {
            document.width(viewBox.outerSize.x).height(viewBox.outerSize.y); 
        }
    }, [desiredHeight, desiredWidth, document, viewBox]);

    React.useEffect(() => {
        if (!document) {
            return;
        }

        const svgControl = new AbstractControl(plugin);
        const svgGroup = document.group();

        SVGHelper.setPosition(svgGroup, 0.5, 0.5);

        let x = viewBox.size.x * 0.5;
        let y = viewBox.size.y * 0.5;

        const shapeAppearance = { ...plugin.defaultAppearance(), ...appearance || {} };

        const item =
            DiagramItem.createShape('1', plugin.identifier(),
                viewBox.size.x,
                viewBox.size.y,
                shapeAppearance)
                .transformWith(t => t.moveTo(new Vec2(x, y)));

        svgControl.setContext(svgGroup);
        svgControl.render(item, undefined);
    }, [appearance, document, plugin, viewBox]);

    return (
        <div ref={ref} style={{ lineHeight: 0 }}>
            <svg ref={innerRef} />
        </div>
    );
}));

export function getViewBox(
    plugin: ShapePlugin,
    desiredWidth?: number,
    desiredHeight?: number,
    usePreviewSize?: boolean, 
    usePreviewOffset?: boolean) {
    let x = 0;
    let y = 0;

    const size = usePreviewSize ?
        plugin.previewSize?.(desiredWidth || 0, desiredHeight || 0) || plugin.defaultSize() : 
        plugin.defaultSize();

    let outerSize = { x: size.x, y: size.y };

    if (usePreviewOffset) {
        const offset = plugin.previewOffset?.();

        if (offset) {
            outerSize.x += offset.left;
            outerSize.x += offset.right;

            outerSize.y += offset.top;
            outerSize.y += offset.bottom;

            x -= offset.left;
            y -= offset.top;
        }
    }

    return { x, y, size, outerSize };
}