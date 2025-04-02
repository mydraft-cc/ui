/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Rotation, Types, Vec2, ViewBox, debounce } from '@app/core';
import { EngineItem } from '@app/wireframes/engine';
import { SvgCanvasView } from '@app/wireframes/engine/svg/canvas/SvgCanvas';
import { SvgEngine } from '@app/wireframes/engine/svg/engine';
import { DefaultAppearance, ShapePlugin, Size, AppTheme } from '@app/wireframes/interface';
import { DefaultConstraintFactory, DiagramItem, Transform } from '@app/wireframes/model';
import { selectEffectiveAppTheme } from '@app/wireframes/model/selectors/themeSelectors';
import { selectDesignThemeMode } from '@app/wireframes/model/actions/designThemeSlice';
import { useAppSelector } from '@app/store';

// List of shapes where text color should be overridden in conflicting theme toolbar previews
const TEXT_OVERRIDE_TARGETS = new Set([
    'Checkbox',
    'Heading',
    'Label',
    'Paragraph',
    'RadioButton',
]);

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

    // The current app theme, passed down for toolbar previews.
    appTheme?: AppTheme;
}

export const ShapeRenderer = React.memo(React.forwardRef<HTMLDivElement, ShapeRendererProps>((props, ref) => {
    const { 
        appTheme,
        appearance,
        desiredHeight,
        desiredWidth,
        plugin, 
        usePreviewOffset,
        usePreviewSize, 
    } = props;

    const designTheme = useAppSelector(selectDesignThemeMode);

    const effectiveAppTheme = useAppSelector(selectEffectiveAppTheme);
    const isDarkMode = effectiveAppTheme === 'dark';

    const [engine, setEngine] = React.useState<SvgEngine | null>(null);
    const item = React.useRef<EngineItem | null>(null);
    const [forceRender, _setForceRender] = React.useState(0);
    const renderPending = React.useRef(false);

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

    const debouncedRerender = React.useCallback(
        debounce(() => {
            if (item.current && !renderPending.current) {
                renderPending.current = true;
                requestAnimationFrame(() => {
                    renderShape();
                    renderPending.current = false;
                });
            }
        }, 50), 
    []);

    // Force re-render when effective theme changes
    React.useEffect(() => {
        if (engine && item.current) {
            debouncedRerender();
        }
    }, [isDarkMode, debouncedRerender, engine]);

    // Extract the shape rendering logic into a separate function
    const renderShape = React.useCallback(() => {
        if (!engine) {
            return;
        }

        // Determine the base appearance by merging defaults and props
        const baseAppearance = { ...plugin.defaultAppearance(), ...appearance || {} };
        let effectiveAppearance = baseAppearance;

        // Check if the shape is one that needs text color override
        const needsOverride = TEXT_OVERRIDE_TARGETS.has(plugin.identifier());

        // Handle App Dark / Design Light conflict
        if (needsOverride && isDarkMode && designTheme === 'light') {
            effectiveAppearance = {
                ...baseAppearance,
                [DefaultAppearance.FOREGROUND_COLOR]: 0xE0E0E0,
            };
        } 
        // Handle App Light / Design Dark conflict
        else if (needsOverride && !isDarkMode && designTheme === 'dark') {
            effectiveAppearance = {
                ...baseAppearance,
                [DefaultAppearance.FOREGROUND_COLOR]: 0x373A3C,
            };
        }

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
                appearance: effectiveAppearance,
                configurables: [],
                constraint: plugin?.constraint?.(DefaultConstraintFactory.INSTANCE),
            });

        if (!item.current) {
            item.current = engine.layer(plugin.identifier()).item(plugin);
        }

        const renderContext = { designThemeMode: designTheme };

        if (item.current && Types.isFunction(item.current.forceReplot)) {
            item.current.forceReplot(shape, renderContext);
        } else {
            item.current.plot(shape, renderContext);
        }
    }, [appearance, engine, plugin, viewBox, designTheme, appTheme]);

    // Call renderShape whenever dependencies change or forceRender changes
    React.useEffect(() => {
        if (!renderPending.current) {
            renderShape();
        }
    }, [renderShape, forceRender]);

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