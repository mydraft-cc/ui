/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ActionReducerMapBuilder, createAction } from '@reduxjs/toolkit';
import { Rect2, Vec2 } from '@app/core/utils';
import { Diagram, EditorState, Transform } from './../internal';
import { createItemsAction, DiagramRef, ItemsRef } from './utils';

export enum AlignmentMode {
    DistributeHorizontal = 'DISTRIBUTE_H',
    DistributeVertical = 'DISTRIBUTE_V',
    HorizontalCenter = 'ALIGN_H_CENTER',
    HorizontalLeft = 'ALIGN_H_LEFT',
    HorizontalRight = 'ALIGN_H_RIGHT',
    VerticalBottom = 'ALIGN_V_BOTTOM',
    VerticalCenter = 'ALIGN_V_CENTER',
    VerticalTop = 'ALIGN_V_TOP',
}

export const alignItems =
    createAction('items/align', (mode: AlignmentMode, diagram: DiagramRef, items: ItemsRef) => {
        return { payload: createItemsAction(diagram, items, { mode }) };
    });

export function buildAlignment(builder: ActionReducerMapBuilder<EditorState>) {
    builder
        .addCase(alignItems, (state, action) => {
            const { diagramId, itemIds, mode } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                switch (mode) {
                    case AlignmentMode.HorizontalLeft:
                        return alignShapes(itemIds, diagram, (b, i) => new Vec2(b.left, i.y));
                    case AlignmentMode.HorizontalRight:
                        return alignShapes(itemIds, diagram, (b, i) => new Vec2(b.right - i.width, i.y));
                    case AlignmentMode.HorizontalCenter:
                        return alignShapes(itemIds, diagram, (b, i) => new Vec2(b.left + (b.width - i.width) * 0.5, i.y));
                    case AlignmentMode.VerticalTop:
                        return alignShapes(itemIds, diagram, (b, i) => new Vec2(i.x, b.top));
                    case AlignmentMode.VerticalBottom:
                        return alignShapes(itemIds, diagram, (b, i) => new Vec2(i.x, b.bottom - i.height));
                    case AlignmentMode.VerticalCenter:
                        return alignShapes(itemIds, diagram, (b, i) => new Vec2(i.x, b.top + (b.height - i.height) * 0.5));
                    case AlignmentMode.DistributeHorizontal:
                        return distributeHorizontally(itemIds, diagram);
                    case AlignmentMode.DistributeVertical:
                        return distributeVertically(itemIds, diagram);
                    default:
                        return diagram;
                }
            });
        });
}

function distributeHorizontally(itemIds: ReadonlyArray<string>, diagram: Diagram) {
    const targetItems = findTargets(itemIds, diagram);
    const targetBounds = Rect2.fromRects(targetItems.map(t => t.aabb));

    let totalWidth = 0;

    for (const target of targetItems) {
        totalWidth += target.aabb.width;
    }

    const margin = (targetBounds.width - totalWidth) / (targetItems.length - 1);

    let x = targetBounds.left;
    let i = 0;

    const sortedTargets = targetItems.sort((a, b) => a.aabb.x - b.aabb.x);
    const sortedTargetIds = sortedTargets.map(x => x.itemId);

    return diagram.updateItems(sortedTargetIds, item => {
        const target = sortedTargets[i++];

        if (x !== target.aabb.x) {
            const newPosition = new Vec2(x, target.aabb.y);

            const dx = newPosition.x - target.aabb.x;
            const dy = newPosition.y - target.aabb.y;

            item = item.transformByBounds(target.transform, target.transform.moveBy(new Vec2(dx, dy)));
        }

        x += target.aabb.width + margin;

        return item;
    });
}

function distributeVertically(itemIds: ReadonlyArray<string>, diagram: Diagram) {
    const targetItems = findTargets(itemIds, diagram);
    const targetBounds = Rect2.fromRects(targetItems.map(t => t.aabb));

    let totalHeight = 0;

    for (const target of targetItems) {
        totalHeight += target.aabb.height;
    }

    const margin = (targetBounds.height - totalHeight) / (targetItems.length - 1);

    let y = targetBounds.top;
    let i = 0;

    const sortedTargets = targetItems.sort((a, b) => a.aabb.y - b.aabb.y);
    const sortedTargetIds = sortedTargets.map(x => x.itemId);

    return diagram.updateItems(sortedTargetIds, item => {
        const target = sortedTargets[i++];

        if (y !== target.aabb.y) {
            const newPosition = new Vec2(target.aabb.x, y);

            const dx = newPosition.x - target.aabb.x;
            const dy = newPosition.y - target.aabb.y;

            item = item.transformByBounds(target.transform, target.transform.moveBy(new Vec2(dx, dy)));
        }

        y += target.aabb.height + margin;

        return item;
    });
}

function alignShapes(itemIds: ReadonlyArray<string>, diagram: Diagram, transformer: (bounds: Rect2, item: Rect2) => Vec2): Diagram {
    const targetItems = findTargets(itemIds, diagram);
    const targetBounds = Rect2.fromRects(targetItems.map(t => t.aabb));

    let i = 0;

    return diagram.updateItems(targetItems.map(x => x.itemId), item => {
        const target = targetItems[i++];

        const newPosition = transformer(targetBounds, target.aabb);

        const dx = newPosition.x - target.aabb.x;
        const dy = newPosition.y - target.aabb.y;

        if (dx !== 0 || dy !== 0) {
            item = item.transformByBounds(target.transform, target.transform.moveBy(new Vec2(dx, dy)));
        }

        return item;
    });
}

function findTargets(itemIds: ReadonlyArray<string>, diagram: Diagram): TransformTarget[] {
    return itemIds.map(id => {
        const transform = diagram.items.get(id)!.bounds(diagram);

        return { transform, aabb: transform.aabb, itemId: id };
    });
}

interface TransformTarget { transform: Transform; aabb: Rect2; itemId: string }
