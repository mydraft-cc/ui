/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { isModKey, Rect2, Subscription, SVGHelper, Vec2 } from '@app/core';
import { calculateSelection, Diagram, DiagramItem, Transform } from '@app/wireframes/model';
import { User, user } from '@app/wireframes/user';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';
import { PreviewEvent } from './preview';

const SELECTION_STROKE_COLOR = '#080';
const SELECTION_STROKE_LOCK_COLOR = '#f00';

export interface SelectionAdornerProps {
    // The current zoom value.
    zoom: number;

    // The adorner scope.
    adorners: svg.Container;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The interaction service.
    interactionService: InteractionService;

    // The preview subscription.
    previewStream: Subscription<PreviewEvent>;

    // A function to select a set of items.
    onSelectItems: (diagram: Diagram, itemIds: string[]) => any;
}

type SelectionMarkers = { rect: svg.Rect; transform?: Transform };

const X: any = {};

export const SelectionAdorner = (props: SelectionAdornerProps) => {
    const {
        adorners,
        interactionService,
        onSelectItems,
        previewStream,
        selectedDiagram,
        zoom,
    } = props;

    const [previewItems, setPreviewItems] = React.useState<Record<string, DiagramItem> | null>(null);
    const [selectionMarkers, setSelectionMarkers] = React.useState<SelectionMarkers[]>([]);
    const selectionUsers = X;
    const selectionHandlerRef = React.useRef(new SelectionHandler());

    React.useEffect(() => {
        previewStream.subscribe(event => {
            if (event.type === 'Update') {
                setPreviewItems(event.items);
            } else {
                setPreviewItems(null);
            }
        });
    }, [previewStream]);

    React.useEffect(() => {
        selectionHandlerRef.current.setAdorners(adorners);
    }, [adorners]);

    React.useEffect(() => {
        selectionHandlerRef.current.setDiagram(selectedDiagram);
    }, [selectedDiagram]);

    React.useEffect(() => {
        selectionHandlerRef.current.setZoom(zoom);
    }, [zoom]);

    React.useEffect(() => {
        selectionHandlerRef.current.setHandler(onSelectItems);
    }, [onSelectItems]);

    React.useEffect(() => {
        const handler = selectionHandlerRef.current;

        interactionService.addHandler(handler);

        return () => {
            interactionService.removeHandler(handler);
        };
    }, [interactionService]);

    React.useEffect(() => {
        setSelectionMarkers(markers => {
            const newMarkers = [...markers];

            for (const marker of newMarkers) {
                marker.transform = undefined;
            }

            const selectedItems: Record<string, { item: DiagramItem; users: User[]; self: boolean }> = {};
    
            for (const [userId, selectedIds] of selectedDiagram.selectedIds.entries) {
                const collaborator = selectionUsers[userId];
    
                if (!collaborator) {
                    continue;
                }
    
                const self = collaborator.id === user.id;
            
                for (const id of selectedIds) {
                    const item = previewItems?.[id] || selectedDiagram.items.get(id);
    
                    if (!item) {
                        continue;
                    }
    
                    let selectedItem = selectedItems[id];
    
                    if (selectedItem) {
                        selectedItem.users.push(collaborator);
                    } else {
                        selectedItem = { item, users: [collaborator], self };
                        selectedItems[id] = selectedItem;
                    }
                }
            }
    
            const selectionArray = Object.values(selectedItems);
    
            // Add more markers if we do not have enough.
            while (newMarkers.length < selectionArray.length) {
                const rect = adorners.rect(1, 1).fill('none').hide();
    
                newMarkers.push({ rect });
            }
    
            if (selectionArray.length === 0) {
                return newMarkers;
            }
    
            selectionArray.forEach((selectedItem, i) => {
                const marker = newMarkers[i];
    
                let color: string;
                if (selectedItem.self) {
                    color = selectedItem.item.isLocked ? SELECTION_STROKE_LOCK_COLOR  : SELECTION_STROKE_COLOR; 
                } else {
                    color = selectedItem.users[0].color;
                }
                        
                marker.rect.stroke({ color });

                // We also use the transform to mark visible shapes.
                marker.transform = selectedItem.item.bounds(selectedDiagram);
            });

            return newMarkers;
        });
    }, [adorners, previewItems, selectedDiagram, selectionUsers]);

    React.useEffect(() => {
        // Use the inverted zoom level as stroke width.
        const strokeWidth = 1 / zoom;

        for (const { transform, rect } of selectionMarkers) {
            if (transform) {
                rect.show();

                // Also adjust the bounds by the border width, to show the border outside of the shape.
                transformShape(rect, transform.position.sub(transform.halfSize), transform.size, strokeWidth, transform.rotation.degree);
            } else {
                rect.hide();
            }
        }
    }, [selectionMarkers, zoom]);

    return null;
};

export class SelectionHandler implements InteractionHandler {
    private selectedDiagram!: Diagram;
    private selectionShape!: svg.Rect;
    private selectionStart: Vec2 | null = null;
    private onSelectItems!: (diagram: Diagram, itemIds: string[]) => any;

    public setHandler(onSelectItems: (diagram: Diagram, itemIds: string[]) => any) {
        // Alternative way to using multiple refs.
        this.onSelectItems = onSelectItems;
    }

    public setDiagram(selectedDiagram: Diagram) {
        // Alternative way to using multiple refs.
        this.selectedDiagram = selectedDiagram;
    }

    public setZoom(zoom: number) {
        // Use the inverted zoom level as stroke width to have a constant stroke style.
        this.selectionShape?.stroke({ width: 1 / zoom });
    }

    public setAdorners(adorners: svg.Container) {
        this.selectionShape =
            adorners.rect(1, 1)
                .stroke({ color: '#0a0', width: 1 })
                .scale(1, 1)
                .fill('#00aa0044')
                .hide();
    }

    public onMouseDown(event: SvgEvent) {
        if (!event.event.shiftKey) {
            const selection = this.selectSingle(event, this.selectedDiagram);

            this.onSelectItems(this.selectedDiagram, selection);
        }

        if (!event.element) {
            this.selectionStart = event.position;
        }
    }

    public onMouseDrag(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (!this.selectionStart) {
            next(event);
            return;
        }

        const rect = Rect2.fromVecs([this.selectionStart, event.position]);

        transformShape(this.selectionShape, new Vec2(rect.x, rect.y), new Vec2(rect.w, rect.h), 0);
    }

    public onMouseUp(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (!this.selectionStart) {
            next(event);
            return;
        }

        try {
            const rect = Rect2.fromVecs([this.selectionStart, event.position]);

            if (rect.area < 100) {
                return;
            }

            const selection = this.selectMultiple(rect, this.selectedDiagram);

            if (!selection) {
                return;
            }

            this.onSelectItems(this.selectedDiagram, selection!);
        } finally {
            this.stopDrag();
        }
    }

    public onBlur(event: FocusEvent, next: (event: FocusEvent) => void) {
        if (!this.selectionStart) {
            next(event);
            return;
        }

        this.stopDrag();
    }

    private stopDrag() {
        this.selectionShape.hide();
        this.selectionStart = null;
    }

    private selectMultiple(rect: Rect2, diagram: Diagram): string[] {
        const selectedItems = diagram.rootItems.filter(i => rect.contains(i.bounds(diagram).aabb));

        return calculateSelection(selectedItems, diagram, user.id, false);
    }

    private selectSingle(event: SvgEvent, diagram: Diagram): string[] {
        const isMod = isModKey(event.event);

        if (isMod) {
            event.event.preventDefault();
        }

        const aabb = event.shape?.bounds(diagram).aabb;

        if (aabb?.contains(event.position) && event.shape) {
            return calculateSelection([event.shape], diagram, user.id, true, isMod);
        } else {
            return [];
        }
    }
}

function transformShape(shape: svg.Rect, position: Vec2, size: Vec2, offset: number, rotation = 0) {
    // We have to disable the adjustment mode to turn off the rounding.
    SVGHelper.transformBy(shape, {
        x: position.x - 0.5 * offset,
        y: position.y - 0.5 * offset,
        w: size.x + offset,
        h: size.y + offset,
        rotation,
    }, false);

    if (size.x > 2 && size.y > 2) {
        shape.show();
    }
}