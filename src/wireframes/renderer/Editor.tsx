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
import { CanvasView } from './CanvasView';
import { NavigateAdorner } from './NavigateAdorner';
import { QuickbarAdorner } from './QuickbarAdorner';
import { RenderLayer } from './RenderLayer';
import { SelectionAdorner } from './SelectionAdorner';
import { TextAdorner } from './TextAdorner';
import { TransformAdorner } from './TransformAdorner';
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

    const adornersSelect = React.useRef<svg.Container>();
    const adornersTransform = React.useRef<svg.Container>();
    const diagramTools = React.useRef<svg.Element>();
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
        diagramTools.current = doc.rect().fill('transparent');
        renderMasterLayer.current = doc.group();
        renderMainLayer.current = doc.group();
        adornersSelect.current = doc.group();
        adornersTransform.current = doc.group();

        setInteractionMainService(new InteractionService([
            adornersSelect.current,
            adornersTransform.current],
        renderMainLayer.current, doc));

        setInteractionMasterService(new InteractionService([
            adornersSelect.current,
            adornersTransform.current],
        renderMasterLayer.current, doc));
    }, []);

    React.useEffect(() => {
        if (interactionMainService) {
            SVGHelper.setPosition(diagramTools.current!, 0.5, 0.5);
            SVGHelper.setPosition(adornersSelect.current!, 0.5, 0.5);
            SVGHelper.setPosition(adornersTransform.current!, 0.5, 0.5);
            SVGHelper.setPosition(renderMasterLayer.current!, 0.5, 0.5);
            SVGHelper.setPosition(renderMainLayer.current!, 0.5, 0.5);
        }
    }, [interactionMainService]);

    React.useEffect(() => {
        if (interactionMainService) {
            SVGHelper.setSize(diagramTools.current!, w, h);
            SVGHelper.setSize(adornersSelect.current!, w, h);
            SVGHelper.setSize(adornersTransform.current!, w, h);
            SVGHelper.setSize(renderMasterLayer.current!, w, h);
            SVGHelper.setSize(renderMainLayer.current!, w, h);
        }
    }, [w, h, interactionMainService]);

    const doPreview = useEventCallback((items: DiagramItem[]) => {
        setInteractionPreviews(items);
        setFullSelection(selectedItemsWithLocked.map(x => items.find(y => x.id === y.id) || x));
    });

    const doPreviewEnd = useEventCallback(() => {
        setInteractionPreviews(undefined);
        setFullSelection(selectedItemsWithLocked);
    });

    return (
        <div className='editor' style={{ background: color.toString() }}>
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
                            adorners={adornersTransform.current!}
                            interactionService={interactionMainService}
                            onPreview={doPreview}
                            onPreviewEnd={doPreviewEnd}
                            onTransformItems={onTransformItems}
                            selectedDiagram={diagram}
                            selectedItems={selectedItems}
                            viewSize={viewSize}
                            zoom={zoom}
                        />
                    }

                    {onSelectItems &&
                        <SelectionAdorner
                            adorners={adornersSelect.current!}
                            interactionService={interactionMainService}
                            onSelectItems={onSelectItems}
                            selectedDiagram={diagram}
                            selectedItems={fullSelection}
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
