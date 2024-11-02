/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable react-hooks/exhaustive-deps */

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { Color, Subscription, SVGHelper, Vec2, ViewBox } from '@app/core';
import { Diagram, DiagramItem, DiagramItemSet, Transform } from '@app/wireframes/model';
import { useOverlayContext } from './../contexts/OverlayContext';
import { CanvasView } from './CanvasView';
import { NavigateAdorner } from './NavigateAdorner';
import { QuickbarAdorner } from './QuickbarAdorner';
import { RenderLayer } from './RenderLayer';
import { SelectionAdorner } from './SelectionAdorner';
import { TextAdorner } from './TextAdorner';
import { TransformAdorner } from './TransformAdorner';
import { InteractionOverlays } from './interaction-overlays'; 
import { InteractionService } from './interaction-service';
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
    } = props;

    const adornerSelectLayer = React.useRef<svg.Container>();
    const adornerTransformLayer = React.useRef<svg.Container>();
    const backgroundLayer = React.useRef<svg.Rect>();
    const overlayContext = useOverlayContext();
    const overlayLayer = React.useRef<svg.Container>();
    const renderMainLayer = React.useRef<svg.Container>();
    const renderMasterLayer = React.useRef<svg.Container>();
    const [interactionMasterService, setInteractionMasterService] = React.useState<InteractionService>();
    const [interactionMainService, setInteractionMainService] = React.useState<InteractionService>();

    // Use a stream of preview updates to bypass react for performance reasons.
    const renderPreview = React.useRef(new Subscription<PreviewEvent>());

    const doInit = React.useCallback((doc: svg.Svg) => {
        // Might be called multiple times in dev mode!
        if (renderMainLayer.current) {
            return;
        }

        // Create these layers in the correct order.
        backgroundLayer.current = doc.rect().id('background').stroke('#efefef').fill(color.toString());
        renderMasterLayer.current = doc.group().id('masterLayer');
        renderMainLayer.current = doc.group().id('parentLayer');
        adornerSelectLayer.current = doc.group().id('selectLayer');
        adornerTransformLayer.current = doc.group().id('transformLayer');
        overlayLayer.current = doc.group().id('overlaysLayer');

        setInteractionMainService(new InteractionService([
            adornerSelectLayer.current,
            adornerTransformLayer.current],
        renderMainLayer.current, doc));

        setInteractionMasterService(new InteractionService([
            adornerSelectLayer.current,
            adornerTransformLayer.current],
        renderMasterLayer.current, doc));

        if (isDefaultView) {
            overlayContext.overlayManager = new InteractionOverlays(overlayLayer.current);
        }
    }, []);

    React.useEffect(() => {
        if (!interactionMainService) {
            return;
        }

        const w = viewSize.x;
        const h = viewSize.y;

        SVGHelper.setSize(adornerSelectLayer.current!, w, h);
        SVGHelper.setSize(adornerTransformLayer.current!, w, h);
        SVGHelper.setSize(backgroundLayer.current!, w, h);
        SVGHelper.setSize(renderMasterLayer.current!, w, h);
        SVGHelper.setSize(renderMainLayer.current!, w, h);
    }, [viewSize, interactionMainService]);

    React.useEffect(() => {
        backgroundLayer.current?.fill(color.toString());
    }, [color]);

    React.useEffect(() => {
        overlayContext.snapManager.prepare(diagram, viewSize);
    }, [diagram, overlayContext.snapManager, viewSize]);
    
    React.useEffect(() => {
        (overlayContext.overlayManager as any)['setZoom']?.(viewBox.zoom);
    }, [diagram, overlayContext.overlayManager, viewBox.zoom]);

    return (
        <div className='editor' ref={element => overlayContext.element = element}>
            <CanvasView onInit={doInit} viewBox={viewBox} />

            {interactionMainService && diagram && (
                <>
                    <RenderLayer
                        background={color}
                        diagram={masterDiagram}
                        diagramLayer={renderMasterLayer.current!}
                        onRender={onRender}
                    />

                    <RenderLayer
                        diagram={diagram}
                        diagramLayer={renderMainLayer.current!}
                        preview={renderPreview.current}
                        onRender={onRender}
                    />

                    {onTransformItems &&
                        <TransformAdorner
                            adorners={adornerTransformLayer.current!}
                            interactionService={interactionMainService}
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
                            adorners={adornerSelectLayer.current!}
                            interactionService={interactionMainService}
                            onSelectItems={onSelectItems}
                            previewStream={renderPreview.current}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            zoom={viewBox.zoom}
                        />
                    }

                    {onChangeItemsAppearance &&
                        <TextAdorner
                            interactionService={interactionMainService}
                            onChangeItemsAppearance={onChangeItemsAppearance}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            zoom={viewBox.zoom}
                        />
                    }

                    {onTransformItems &&
                        <QuickbarAdorner
                            previewStream={renderPreview.current}
                            selectedDiagram={diagram}
                            selectionSet={selectionSet}
                            viewSize={viewSize}
                            zoom={viewBox.zoom}
                        />
                    }

                    {onNavigate &&
                        <NavigateAdorner interactionService={interactionMainService} onNavigate={onNavigate} />
                    }

                    {onNavigate && interactionMasterService &&
                        <NavigateAdorner interactionService={interactionMasterService} onNavigate={onNavigate} />
                    }
                </>
            )}
        </div>
    );
});
