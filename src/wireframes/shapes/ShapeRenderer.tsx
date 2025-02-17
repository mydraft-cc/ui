/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Rotation, Vec2, ViewBox } from '@app/core';
import { EngineItem } from '@app/wireframes/engine';
import { SvgCanvasView } from '@app/wireframes/engine/svg/canvas/SvgCanvas';
import { SvgEngine } from '@app/wireframes/engine/svg/engine';
import { ShapePlugin, Size } from '@app/wireframes/interface';
import { DefaultConstraintFactory, DiagramItem, Transform } from '@app/wireframes/model';

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

    const [engine, setEngine] = React.useState<SvgEngine>();
    const item = React.useRef<EngineItem>();

    const viewBox = getViewBox(plugin, 
        desiredWidth,
        desiredHeight,
        usePreviewSize,
        usePreviewOffset);

    React.useEffect(() => {
        if (!engine) {
            return;
        }

        if (desiredWidth && desiredHeight) {
            let aspectRatio = viewBox.maxX / viewBox.maxY;
        
            if (aspectRatio > desiredWidth / desiredHeight) {
                engine.doc.width(desiredWidth);
            } else {
                engine.doc.height(desiredHeight);
            }
        } else {
            engine.doc.width(viewBox.maxX).height(viewBox.maxY); 
        }
    }, [desiredHeight, desiredWidth, engine, viewBox]);

    React.useEffect(() => {
        if (!engine) {
            return;
        }

        engine.doc.clear();

        const shape =
            DiagramItem.createShape({
                renderer: plugin.identifier(),
                transform: new Transform(
                    new Vec2(
                        viewBox.size.x * 0.5,
                        viewBox.size.y * 0.5), 
                    new Vec2(
                        viewBox.size.x,
                        viewBox.size.y),
                    Rotation.ZERO),
                appearance: { ...plugin.defaultAppearance(), ...appearance || {} },
                configurables: [],
                constraint: plugin?.constraint?.(DefaultConstraintFactory.INSTANCE),
            });

        if (!item.current) {
            item.current = engine.layer(plugin.identifier()).item(plugin);
        }

        item.current.plot(shape);
    }, [appearance, engine, plugin, viewBox]);

    return (
        <div ref={ref} style={{ lineHeight: 0 }}>
            <SvgCanvasView viewBox={viewBox} onInit={setEngine} />
        </div>
    );
}));

export function getViewBox(
    plugin: ShapePlugin,
    desiredWidth?: number,
    desiredHeight?: number,
    usePreviewSize?: boolean, 
    usePreviewOffset?: boolean): ViewBox & { size: Size } {
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

    return { minX: x, minY: y, maxX: outerSize.x, maxY: outerSize.y, size, zoom: 1 };
}