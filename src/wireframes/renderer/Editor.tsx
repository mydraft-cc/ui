/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { Color, Rect2, SVGHelper, useEventCallback, Vec2 } from '@app/core';
import { Diagram, DiagramItem, Transform } from '@app/wireframes/model';
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
import './Editor.scss';

export interface EditorProps {
    // The selected diagram.
    diagram: Diagram;

    // The master diagram.
    masterDiagram?: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The selected items including locked items.
    selectedItemsWithLocked: DiagramItem[];

    // The zoomed width of the canvas.
    zoomedSize: Vec2;

    // The color.
    color: Color;

    // The optional viewbox.
    viewBox?: Rect2;

    // The view size.
    viewSize: Vec2;

    // The zoom value of the canvas.
    zoom: number;

    // True when rendered.
    onRender?: () => void;

    // A function to select a set of items.
    onSelectItems?: (diagram: Diagram, itemIds: string[]) => any;

    // A function to change the appearance of a visual.
    onChangeItemsAppearance?: (diagram: Diagram, visuals: DiagramItem[], key: string, val: any) => any;

    // A function that is invoked when the user clicked a link.
    onNavigate?: (item: DiagramItem, link: string) => void;

    // A function to transform a set of items.
    onTransformItems?: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => any;
}

export const Editor = React.memo((props: EditorProps) => {
    const {
        color,
        diagram,
        masterDiagram,
        onChangeItemsAppearance,
        onNavigate,
        onRender,
        onSelectItems,
        onTransformItems,
        selectedItems,
        selectedItemsWithLocked,
        viewBox,
        viewSize,
        zoom,
        zoomedSize,
    } = props;

    const w = viewSize.x;
    const h = viewSize.y;

    const adornerSelectLayer = React.useRef<svg.Container>();
    const adornerTransformLayer = React.useRef<svg.Container>();
    const diagramTools = React.useRef<svg.Element>();
    const overlayContext = useOverlayContext();
    const overlayLayer = React.useRef<svg.Container>();
    const renderMainLayer = React.useRef<svg.Container>();
    const renderMasterLayer = React.useRef<svg.Container>();
    const [interactionMasterService, setInteractionMasterService] = React.useState<InteractionService>();
    const [interactionMainService, setInteractionMainService] = React.useState<InteractionService>();
    const [interactionPreviews, setInteractionPreviews] = React.useState<DiagramItem[]>();
    const [fullSelection, setFullSelection] = React.useState<DiagramItem[]>([]);

    React.useEffect(() => {
        setFullSelection(selectedItemsWithLocked);
    }, [selectedItemsWithLocked]);

    const doInit = React.useCallback((doc: svg.Svg) => {
        // Create these layers in the correct order.
        diagramTools.current = doc.rect().fill('transparent');
        renderMasterLayer.current = doc.group();
        renderMainLayer.current = doc.group();
        adornerSelectLayer.current = doc.group();
        adornerTransformLayer.current = doc.group();
        overlayLayer.current = doc.group();
        overlayContext.overlayManager = new InteractionOverlays(overlayLayer.current);

        SVGHelper.setPosition(adornerSelectLayer.current!, 0.5, 0.5);
        SVGHelper.setPosition(adornerTransformLayer.current!, 0.5, 0.5);
        SVGHelper.setPosition(adornerTransformLayer.current!, 0.5, 0.5);
        SVGHelper.setPosition(diagramTools.current!, 0.5, 0.5);
        SVGHelper.setPosition(overlayLayer.current!, 0.5, 0.5);
        SVGHelper.setPosition(renderMainLayer.current!, 0.5, 0.5);

        setInteractionMainService(new InteractionService([
            adornerSelectLayer.current,
            adornerTransformLayer.current],
        renderMainLayer.current, doc));

        setInteractionMasterService(new InteractionService([
            adornerSelectLayer.current,
            adornerTransformLayer.current],
        renderMasterLayer.current, doc));
    }, [overlayContext]);

    React.useEffect(() => {
        if (interactionMainService) {
            SVGHelper.setSize(diagramTools.current!, w, h);
            SVGHelper.setSize(adornerSelectLayer.current!, w, h);
            SVGHelper.setSize(adornerTransformLayer.current!, w, h);
            SVGHelper.setSize(diagramTools.current!, 0.5, 0.5);
            SVGHelper.setSize(renderMasterLayer.current!, w, h);
            SVGHelper.setSize(renderMainLayer.current!, w, h);
        }
    }, [w, h, interactionMainService]);
    
    React.useEffect(() => {
        overlayContext.snapManager.prepare(diagram, viewSize);
    }, [diagram, overlayContext.snapManager, viewSize]);
    
    React.useEffect(() => {
        overlayContext.overlayManager['setZoom']?.(zoom);
    }, [diagram, overlayContext.overlayManager, zoom]);

    const doPreview = useEventCallback((items: DiagramItem[]) => {
        setInteractionPreviews(items);
        setFullSelection(selectedItemsWithLocked.map(x => items.find(y => x.id === y.id) || x));
    });

    const doPreviewEnd = useEventCallback(() => {
        setInteractionPreviews(undefined);
        setFullSelection(selectedItemsWithLocked);
    });

    return (
        <div className='editor' style={{ background: color.toString() }} ref={element => overlayContext.element = element}>
            <CanvasView
                onInit={doInit}
                viewBox={viewBox}
                viewSize={viewSize}
                zoom={zoom}
                zoomedSize={zoomedSize} />

            {interactionMainService && diagram && (
                <>
                    <RenderLayer
                        diagram={masterDiagram}
                        diagramLayer={renderMasterLayer.current!}
                        onRender={onRender}
                    />

                    <RenderLayer
                        diagram={diagram}
                        diagramLayer={renderMainLayer.current!}
                        previewItems={interactionPreviews}
                        onRender={onRender}
                    />

                    {onTransformItems &&
                        <TransformAdorner
                            adorners={adornerTransformLayer.current!}
                            interactionService={interactionMainService}
                            onPreview={doPreview}
                            onPreviewEnd={doPreviewEnd}
                            onTransformItems={onTransformItems}
                            overlayManager={overlayContext.overlayManager}
                            selectedDiagram={diagram}
                            selectedItems={selectedItems}
                            snapManager={overlayContext.snapManager}
                            viewSize={viewSize}
                            zoom={zoom}
                        />
                    }

                    {onSelectItems &&
                        <SelectionAdorner
                            adorners={adornerSelectLayer.current!}
                            interactionService={interactionMainService}
                            onSelectItems={onSelectItems}
                            selectedDiagram={diagram}
                            selectedItems={fullSelection}
                            zoom={zoom}
                        />
                    }

                    {onChangeItemsAppearance &&
                        <TextAdorner
                            interactionService={interactionMainService}
                            onChangeItemsAppearance={onChangeItemsAppearance}
                            selectedDiagram={diagram}
                            selectedItems={selectedItems}
                            zoom={zoom}
                        />
                    }

                    {onTransformItems &&
                        <QuickbarAdorner
                            isPreviewing={!!interactionPreviews}
                            selectedDiagram={diagram}
                            selectedItems={selectedItems}
                            viewSize={viewSize}
                            zoom={zoom}
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
