import { Reducer } from 'redux';

import { Rect2, Vec2 } from '@app/core';

import {
    Diagram,
    EditorState,
    Transform
} from './../internal';

import {
    createItemsAction,
    DiagramRef,
    ItemsRef
} from './utils';

export const ALIGN_H_LEFT   = 'ALIGN_H_LEFT';
export const ALIGN_H_RIGHT  = 'ALIGN_H_RIGHT';
export const ALIGN_H_CENTER = 'ALIGN_H_CENTER';
export const ALIGN_V_TOP    = 'ALIGN_V_TOP';
export const ALIGN_V_BOTTOM = 'ALIGN_V_BOTTOM';
export const ALIGN_V_CENTER = 'ALIGN_V_CENTER';
export const DISTRIBUTE_H   = 'DISTRIBUTE_H';
export const DISTRIBUTE_V   = 'DISTRIBUTE_V';

export const ALIGN_ITEMS = 'ALIGN_ITEMS';
export const alignItems = (mode: string, diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(ALIGN_ITEMS, diagram, items, { mode });
};

export function alignment(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        if (action.type === ALIGN_ITEMS) {
            switch (action.mode) {
                case ALIGN_H_LEFT:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return alignShapes(action.itemIds, diagram, (b, i) => new Vec2(b.left, i.y));
                    });
                case ALIGN_H_RIGHT:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return alignShapes(action.itemIds, diagram, (b, i) => new Vec2(b.right - i.width, i.y));
                    });
                case ALIGN_H_CENTER:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return alignShapes(action.itemIds, diagram, (b, i) => new Vec2(b.left + (b.width - i.width) * 0.5, i.y));
                    });
                case ALIGN_V_TOP:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return alignShapes(action.itemIds, diagram, (b, i) => new Vec2(i.x, b.top));
                    });
                case ALIGN_V_BOTTOM:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return alignShapes(action.itemIds, diagram, (b, i) => new Vec2(i.x, b.bottom - i.height));
                    });
                case ALIGN_V_CENTER:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return alignShapes(action.itemIds, diagram, (b, i) => new Vec2(i.x, b.top + (b.height - i.height) * 0.5));
                    });
                case DISTRIBUTE_H:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return distributeHorizontally(action.itemIds, diagram);
                    });
                case DISTRIBUTE_V:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return distributeVertically(action.itemIds, diagram);
                    });
                default:
                    return state;
            }
        }

        return state;
    };

    return reducer;
}

function distributeHorizontally(itemIds: string[], diagram: Diagram) {
    const targets = findTargets(itemIds, diagram);

    const bounds = Rect2.fromRects(targets.map(t => t.aabb));

    let totalWidth = 0;

    for (let target of targets) {
        totalWidth += target.aabb.width;
    }

    const margin = (bounds.width - totalWidth) / (targets.length - 1);

    let x = bounds.left;

    for (let target of targets.sort((a, b) => a.aabb.x - b.aabb.x)) {
        if (x !== target.aabb.x) {
            const newPosition = new Vec2(x, target.aabb.y);

            const dx = newPosition.x - target.aabb.x;
            const dy = newPosition.y - target.aabb.y;

            diagram = diagram.updateItem(target.itemId, item => {
                return item.transformByBounds(target.transform, target.transform.moveBy(new Vec2(dx, dy)));
            });
        }

        x += target.aabb.width + margin;
    }

    return diagram;
}

function distributeVertically(itemIds: string[], diagram: Diagram) {
    const targets = findTargets(itemIds, diagram);

    const bounds = Rect2.fromRects(targets.map(t => t.aabb));

    let totalHeight = 0;

    for (let target of targets) {
        totalHeight += target.aabb.height;
    }

    const margin = (bounds.height - totalHeight) / (targets.length - 1);

    let y = bounds.top;

    for (let target of targets.sort((a, b) => a.aabb.y - b.aabb.y)) {
        if (y !== target.aabb.y) {
            const newPosition = new Vec2(target.aabb.x, y);

            const dx = newPosition.x - target.aabb.x;
            const dy = newPosition.y - target.aabb.y;

            diagram = diagram.updateItem(target.itemId, item => {
                return item.transformByBounds(target.transform, target.transform.moveBy(new Vec2(dx, dy)));
            });
        }

        y += target.aabb.height + margin;
    }

    return diagram;
}

function alignShapes(itemIds: string[], diagram: Diagram, transformer: (bounds: Rect2, item: Rect2) => Vec2): Diagram {
    const targets = findTargets(itemIds, diagram);

    const bounds = Rect2.fromRects(targets.map(t => t.aabb));

    for (let target of targets) {
        const newPosition = transformer(bounds, target.aabb);

        const dx = newPosition.x - target.aabb.x;
        const dy = newPosition.y - target.aabb.y;

        if (dx !== 0 || dy !== 0) {
            diagram = diagram.updateItem(target.itemId, item => {
                return item.transformByBounds(target.transform, target.transform.moveBy(new Vec2(dx, dy)));
            });
        }
    }

    return diagram;
}

function findTargets(itemIds: string[], diagram: Diagram): TransformTarget[] {
    return itemIds.map(id => {
        const transform = diagram.items.get(id)!.bounds(diagram);

        return { transform, aabb: transform.aabb, itemId: id };
    });
}

interface TransformTarget { transform: Transform; aabb: Rect2; itemId: string; }