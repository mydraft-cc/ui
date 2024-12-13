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
    useWebGL: boolean;

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

    const [engine, setEngine] = React.useState<Engine>();
    const adornerSelectLayer = React.useRef<EngineLayer>();
    const adornerTransformLayer = React.useRef<EngineLayer>();
    const initialWebGL = React.useRef(useWebGL);
    const overlayContext = useOverlayContext();
    const overlayLayer = React.useRef<EngineLayer>();
    const renderMainLayer = React.useRef<EngineLayer>();
    const renderMasterLayer = React.useRef<EngineLayer>();
    const [backgroundRect, setBackgroundRect] = React.useState<EngineRect>();

    // Use a stream of preview updates to bypass react for performance reasons.
    const renderPreview = React.useRef(new Subscription<PreviewEvent>());
    
    const doInit = React.useCallback((engine: Engine) => {
        // Might be called multiple times in dev mode!
        if (!engine) {
            return;
        }

        // Create these layers in the correct order.
        const background = engine.layer('background').rect();
        background.disable();
        background.fill(color.toString());
        background.strokeWidth(1);
        background.strokeColor('#efefef');
        setBackgroundRect(background);

        renderMasterLayer.current = engine.layer('masterLayer');
        renderMainLayer.current = engine.layer('parentLayer');
        overlayLayer.current = engine.layer('overlaysLayer');
        adornerSelectLayer.current = engine.layer('selectLayer');
        adornerTransformLayer.current = engine.layer('transformLayer');

        engine.setClickLayer(renderMainLayer.current);

        if (isDefaultView) {
            overlayContext.overlayManager = new InteractionOverlays(overlayLayer.current);
        }

        setEngine(engine);
    }, []);

    React.useEffect(() => {
        backgroundRect?.plot({ x: 0, y: 0, w: viewSize.x, h: viewSize.y });
    }, [backgroundRect, viewSize]);

    React.useEffect(() => {
        backgroundRect?.fill(color.toString());
    }, [backgroundRect, color]);

    React.useEffect(() => {
        overlayContext.snapManager.prepare(diagram, viewSize);
    }, [diagram, overlayContext.snapManager, viewSize]);
    
    React.useEffect(() => {
        (overlayContext.overlayManager as any)['setZoom']?.(viewBox.zoom);
    }, [diagram, overlayContext.overlayManager, viewBox.zoom]);

    const showAdorners = React.useCallback(() => {
        adornerSelectLayer.current?.show();
        adornerTransformLayer.current?.show();
    }, []);

    const hideAdorners = React.useCallback(() => {
        adornerSelectLayer.current?.hide();
        adornerTransformLayer.current?.hide();
    }, []);

    return (
        <div className='editor' ref={element => overlayContext.element = element}>
            {initialWebGL.current ? (
                <div className='pixi'>
                    <PixiCanvasView onInit={doInit} viewBox={viewBox} background='#f0f2f5' />
                </div>
            ) : (
                <SvgCanvasView onInit={doInit} viewBox={viewBox} />
            )}

            {engine && diagram && (
                <>
                    <ItemsLayer
                        diagram={masterDiagram}
                        diagramLayer={renderMasterLayer.current!}
                        onRender={onRender}
                    />

                    <ItemsLayer
                        diagram={diagram}
                        diagramLayer={renderMainLayer.current!}
                        preview={renderPreview.current}
                        onRender={onRender}
                    />

                    {onTransformItems &&
                        <TransformAdorner
                            engine={engine}
                            layer={adornerTransformLayer.current!}
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
                            layer={adornerSelectLayer.current!}
                            engine={engine}
                            onSelectItems={onSelectItems}
                            previewStream={renderPreview.current}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            zoom={viewBox.zoom}
                        />
                    }

                    {onChangeItemsAppearance &&
                        <TextAdorner
                            engine={engine}
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
                        <NavigateAdorner engine={engine} onNavigate={onNavigate} />
                    }
                </>
            )}
        </div>
    );
});
