/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable react-hooks/exhaustive-deps */

import * as React from 'react';
import { Color, Subscription, Vec2, ViewBox } from '@app/core';
import { Engine, EngineLayer, EngineRect } from '@app/wireframes/engine';
import { PixiCanvasView } from '@app/wireframes/engine/pixi/canvas/PixiCanvas';
import { SvgCanvasView } from '@app/wireframes/engine/svg/canvas/SvgCanvas';
import { Diagram, DiagramItem, DiagramItemSet, Transform } from '@app/wireframes/model';
import { useOverlayContext } from './../contexts/OverlayContext';
import { ItemsLayer } from './ItemsLayer';
import { NavigateAdorner } from './NavigateAdorner';
import { QuickbarAdorner } from './QuickbarAdorner';
import { SelectionAdorner } from './SelectionAdorner';
import { TextAdorner } from './TextAdorner';
import { TransformAdorner } from './TransformAdorner';
import { InteractionOverlays } from './interaction-overlays'; 
import { PreviewEvent } from './preview';
import './Editor.scss';

export interface EditorProps {
    // The selected diagram.
    diagram: Diagram;

    // The master diagram.
    masterDiagram?: Diagram;

    // The selected items.
    selectionSet: DiagramItemSet;

    // The color.
    color: Color;

    // The viewbox.
    viewBox: ViewBox;

    // The view size.
    viewSize: Vec2;

    // Use WebGL renderer.
    useWebGL?: boolean;

    // True, if it is the default view.
    isDefaultView: boolean;

    // True when rendered.
    onRender?: () => void;

    // A function to select a set of items.
    onSelectItems?: (diagram: Diagram, itemIds: ReadonlyArray<string>) => any;

    // A function to change the appearance of a visual.
    onChangeItemsAppearance?: (diagram: Diagram, visuals: ReadonlyArray<DiagramItem>, key: string, val: any) => any;

    // A function that is invoked when the user clicked a link.
    onNavigate?: (item: DiagramItem, link: string) => void;

    // A function to transform a set of items.
    onTransformItems?: (diagram: Diagram, items: ReadonlyArray<DiagramItem>, oldBounds: Transform, newBounds: Transform) => any;
}

type Layers = {
    adornerSelectLayer: EngineLayer;
    adornerTransformLayer: EngineLayer;
    backgroundRect: EngineRect;
    engine: Engine;
    overlayLayer: EngineLayer;
    renderMainLayer: EngineLayer;
    renderMasterLayer: EngineLayer;
};

export const Editor = React.memo((props: EditorProps) => {
    const {
        color,
        diagram,
        isDefaultView,
        masterDiagram,
        onChangeItemsAppearance,
        onNavigate,
        onRender,
        onSelectItems,
        onTransformItems,
        selectionSet,
        viewBox,
        viewSize,
        useWebGL,
    } = props;

    const [layers, setLayers] = React.useState<Layers>();
    const renderWebGL = React.useRef(useWebGL);
    const renderPreview = React.useRef(new Subscription<PreviewEvent>());
    const overlayContext = useOverlayContext();
    
    const doInit = React.useCallback((engine: Engine) => {
        // Might be called multiple times in dev mode!
        if (!engine) {
            return;
        }

        // Create these layers in the correct order.
        const backgroundRect = engine.layer('background').rect();
        backgroundRect.disable();
        backgroundRect.fill(color.toString());
        backgroundRect.strokeWidth(1);
        backgroundRect.strokeColor('#efefef');

        const renderMasterLayer = engine.layer('masterLayer');
        const renderMainLayer = engine.layer('parentLayer');
        const overlayLayer = engine.layer('overlaysLayer');
        const adornerSelectLayer = engine.layer('selectLayer');
        const adornerTransformLayer = engine.layer('transformLayer');

        engine.setClickLayer(renderMainLayer);

        if (isDefaultView) {
            overlayContext.overlayManager = new InteractionOverlays(overlayLayer);
        }

        setLayers({
            adornerSelectLayer,
            adornerTransformLayer,
            backgroundRect,
            engine,
            overlayLayer,
            renderMainLayer,
            renderMasterLayer,
        });
    }, []);

    React.useEffect(() => {
        layers?.backgroundRect?.plot({ x: 0, y: 0, w: viewSize.x, h: viewSize.y });
    }, [layers, viewSize]);

    React.useEffect(() => {
        layers?.backgroundRect?.fill(color.toString());
    }, [layers, color]);

    React.useEffect(() => {
        overlayContext.snapManager.prepare(diagram, viewSize);
    }, [diagram, overlayContext.snapManager, viewSize]);
    
    React.useEffect(() => {
        (overlayContext.overlayManager as any)['setZoom']?.(viewBox.zoom);
    }, [diagram, overlayContext.overlayManager, viewBox.zoom]);

    const showAdorners = React.useCallback(() => {
        layers?.adornerSelectLayer.show();
        layers?.adornerTransformLayer.show();
    }, []);

    const hideAdorners = React.useCallback(() => {
        layers?.adornerSelectLayer.hide();
        layers?.adornerTransformLayer.hide();
    }, []);

    return (
        <div className='editor' ref={element => overlayContext.element = element}>
            {renderWebGL.current ? (
                <div className='pixi'>
                    <PixiCanvasView onInit={doInit} viewBox={viewBox} background='#f0f2f5' />
                </div>
            ) : (
                <SvgCanvasView onInit={doInit} viewBox={viewBox} />
            )}

            {diagram && layers && (
                <>
                    <ItemsLayer
                        diagram={masterDiagram}
                        diagramLayer={layers.renderMasterLayer}
                        onRender={onRender}
                    />

                    <ItemsLayer
                        diagram={diagram}
                        diagramLayer={layers.renderMainLayer}
                        preview={renderPreview.current}
                        onRender={onRender}
                    />

                    {onTransformItems &&
                        <TransformAdorner
                            engine={layers.engine}
                            layer={layers.adornerTransformLayer}
                            onTransformItems={onTransformItems}
                            overlayManager={overlayContext.overlayManager}
                            previewStream={renderPreview.current}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            snapManager={overlayContext.snapManager}
                            viewSize={viewSize}
                            zoom={viewBox.zoom}
                        />
                    }

                    {onSelectItems &&
                        <SelectionAdorner
                            engine={layers.engine}
                            layer={layers.adornerSelectLayer}
                            onSelectItems={onSelectItems}
                            previewStream={renderPreview.current}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            zoom={viewBox.zoom}
                        />
                    }

                    {onChangeItemsAppearance &&
                        <TextAdorner
                            engine={layers.engine}
                            hideAdorners={hideAdorners}
                            onChangeItemsAppearance={onChangeItemsAppearance}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            showAdorners={showAdorners}
                            zoom={viewBox.zoom}
                        />
                    }

                    {onTransformItems &&
                        <QuickbarAdorner
                            previewStream={renderPreview.current}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            viewBox={viewBox}
                        />
                    }

                    {onNavigate &&
                        <NavigateAdorner engine={layers.engine} onNavigate={onNavigate} />
                    }
                </>
            )}
        </div>
    );
});
