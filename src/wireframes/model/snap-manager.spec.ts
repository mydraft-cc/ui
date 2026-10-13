/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rotation, Vec2 } from '@app/core/utils';
import { Diagram, DiagramItem, SnapManager, Transform } from '@app/wireframes/model';

/* eslint-disable @typescript-eslint/naming-convention */

describe('SnapManager', () => {
    const VIEW = new Vec2(1000, 1000);

    function rect(x: number, y: number, w: number, h: number, rotation = 0) {
        return new Transform(new Vec2(x + w * 0.5, y + h * 0.5), new Vec2(w, h), Rotation.fromDegree(rotation));
    }

    function shape(id: string, x: number, y: number, w: number, h: number) {
        return DiagramItem.createShape({ id, renderer: 'Button', transform: rect(x, y, w, h) });
    }

    function createManager(...shapes: DiagramItem[]) {
        let diagram = Diagram.create({ id: '1' });

        for (const item of shapes) {
            diagram = diagram.addShape(item);
        }

        const snapManager = new SnapManager();
        snapManager.prepare(diagram, VIEW);

        return snapManager;
    }

    describe('rotating', () => {
        const transform = rect(100, 100, 40, 40, 10);

        it('should snap to multiple of 22.5 degrees', () => {
            const result = new SnapManager().snapRotating(transform, 20, 'Shapes');

            expect(result).toEqual(22.5 - 10);
        });

        it('should round to full degrees if snapping is disabled', () => {
            const result = new SnapManager().snapRotating(transform, 20.4, 'None');

            expect(result).toEqual(20);
        });
    });

    describe('moving', () => {
        it('should not snap if snapping is disabled', () => {
            const snapManager = createManager(shape('a', 103, 700, 40, 40));

            const result = snapManager.snapMoving(rect(100, 100, 40, 40), new Vec2(1, 2), 'None');

            expect(result.delta).toEqual(new Vec2(1, 2));
            expect(result.snapX).toBeUndefined();
            expect(result.snapY).toBeUndefined();
        });

        it('should snap position to grid', () => {
            const snapManager = createManager();

            const result = snapManager.snapMoving(rect(100, 100, 40, 40), new Vec2(13, 26), 'Grid');

            expect(result.delta).toEqual(new Vec2(10, 30));
        });

        it('should not snap to shapes in grid mode', () => {
            const snapManager = createManager(shape('a', 112, 700, 40, 40));

            const result = snapManager.snapMoving(rect(100, 100, 40, 40), new Vec2(11, 0), 'Grid');

            expect(result.delta).toEqual(new Vec2(10, 0));
            expect(result.snapX).toBeUndefined();
        });

        it('should snap left edge to left edge of other shape', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const result = snapManager.snapMoving(rect(100, 100, 60, 40), new Vec2(100, 0), 'Shapes');

            expect(result.delta.x).toEqual(103);
            expect(result.snapX?.value).toEqual(203);
            expect(result.snapX?.side).toEqual('Left');
        });

        it('should snap right edge to right edge of other shape', () => {
            const snapManager = createManager(shape('a', 200, 700, 40, 40));

            // Right edge is at 238, the right edge of the other shape is at 240.
            const result = snapManager.snapMoving(rect(178, 100, 60, 40), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(2);
            expect(result.snapX?.side).toEqual('Right');
        });

        it('should snap to nearest line instead of first line in threshold', () => {
            const snapManager = createManager(
                shape('a', 104, 100, 20, 20),
                shape('b', 101, 300, 60, 20));

            const result = snapManager.snapMoving(rect(100, 700, 40, 40), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(1);
            expect(result.snapX?.value).toEqual(101);
        });

        it('should snap center to center of other shape', () => {
            const snapManager = createManager(shape('a', 200, 700, 40, 40));

            // Center is at 218, the center of the other shape at 220.
            const result = snapManager.snapMoving(rect(168, 100, 100, 40), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(2);
            expect(result.snapX?.isCenter).toBeTruthy();
        });

        it('should not snap edges to center lines', () => {
            const snapManager = createManager(shape('a', 200, 700, 40, 40));

            // Left edge is at 218, the center of the other shape at 220.
            const result = snapManager.snapMoving(rect(218, 100, 100, 40), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(0);
            expect(result.snapX).toBeUndefined();
        });

        it('should snap to view bounds and center', () => {
            const snapManager = createManager();

            const result = snapManager.snapMoving(rect(478, 3, 40, 40), new Vec2(0, 0), 'Shapes');

            expect(result.delta).toEqual(new Vec2(2, -3));
            expect(result.snapX?.isCenter).toBeTruthy();
            expect(result.snapY?.value).toEqual(0);
        });

        it('should report snap line if shape is already aligned', () => {
            const snapManager = createManager(shape('a', 200, 700, 40, 40));

            const result = snapManager.snapMoving(rect(200, 100, 60, 40), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(0);
            expect(result.snapX?.value).toEqual(200);
        });

        it('should snap with start edge to distance line on the right side', () => {
            const snapManager = createManager(
                shape('a', 100, 100, 50, 50),
                shape('b', 200, 100, 50, 50));

            const result = snapManager.snapMoving(rect(302, 100, 50, 50), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(-2);
            expect(result.snapX?.gridSide).toEqual('Right');
            expect(result.snapX?.diff?.x).toEqual(50);
            expect(result.snapX?.positions).toEqual([
                { x: 250, y: 125 },
                { x: 150, y: 125 },
            ]);
        });

        it('should snap with end edge to distance line on the left side', () => {
            const snapManager = createManager(
                shape('a', 200, 100, 50, 50),
                shape('b', 300, 100, 50, 50));

            // Right edge is at 152, the distance line at 150.
            const result = snapManager.snapMoving(rect(92, 100, 60, 50), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(-2);
            expect(result.snapX?.gridSide).toEqual('Left');
        });

        it('should not snap end edge to distance line on the right side', () => {
            const snapManager = createManager(
                shape('a', 100, 100, 50, 50),
                shape('b', 200, 100, 50, 50));

            // Right edge is at 302, but the distance line at 300 requires the left edge.
            const result = snapManager.snapMoving(rect(242, 100, 60, 50), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(0);
            expect(result.snapX).toBeUndefined();
        });

        it('should not snap to distance line if shapes do not overlap', () => {
            const snapManager = createManager(
                shape('a', 100, 100, 50, 50),
                shape('b', 200, 100, 50, 50));

            const result = snapManager.snapMoving(rect(302, 600, 50, 50), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(0);
            expect(result.snapX).toBeUndefined();
        });

        it('should snap vertically to distance line', () => {
            const snapManager = createManager(
                shape('a', 100, 100, 50, 50),
                shape('b', 100, 200, 50, 50));

            const result = snapManager.snapMoving(rect(100, 303, 50, 50), new Vec2(0, 0), 'Shapes');

            expect(result.delta.y).toEqual(-3);
            expect(result.snapY?.gridSide).toEqual('Bottom');
            expect(result.snapY?.diff?.y).toEqual(50);
        });

        it('should scale threshold with zoom', () => {
            // Use a wide shape, so that the right edge and center are not in the zoomed out threshold.
            const snapManager = createManager(shape('a', 203, 700, 200, 40));

            snapManager.setZoom(2);

            const zoomedIn = snapManager.snapMoving(rect(200, 100, 60, 40), new Vec2(0, 0), 'Shapes');

            expect(zoomedIn.snapX).toBeUndefined();

            snapManager.setZoom(0.25);

            const zoomedOut = snapManager.snapMoving(rect(188, 100, 60, 40), new Vec2(0, 0), 'Shapes');

            expect(zoomedOut.delta.x).toEqual(15);
            expect(zoomedOut.snapX?.value).toEqual(203);
        });

        it('should ignore invalid zoom', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            snapManager.setZoom(0);

            const result = snapManager.snapMoving(rect(200, 100, 60, 40), new Vec2(0, 0), 'Shapes');

            expect(result.delta.x).toEqual(3);
        });

        it('should not snap to ignored shapes', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const result = snapManager.snapMoving(rect(200, 100, 60, 40), new Vec2(0, 0), 'Shapes', new Set(['a']));

            expect(result.snapX).toBeUndefined();
        });

        it('should recompute lines if ignore list changes', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const result1 = snapManager.snapMoving(rect(200, 100, 60, 40), new Vec2(0, 0), 'Shapes', new Set(['a']));
            const result2 = snapManager.snapMoving(rect(200, 100, 60, 40), new Vec2(0, 0), 'Shapes', new Set());

            expect(result1.snapX).toBeUndefined();
            expect(result2.snapX?.value).toEqual(203);
        });

        it('should reuse lines if ignore list has same content', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const lines1 = snapManager.getSnapLines(new Set(['a']));
            const lines2 = snapManager.getSnapLines(new Set(['a']));

            expect(lines2.xLines).toBe(lines1.xLines);
        });

        it('should recompute lines after prepare', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const lines1 = snapManager.getSnapLines();

            snapManager.prepare(Diagram.create({ id: '2' }), VIEW);

            const lines2 = snapManager.getSnapLines();

            expect(lines2.xLines).not.toBe(lines1.xLines);
            expect(lines2.xLines.length).toEqual(3);
        });
    });

    describe('resizing', () => {
        it('should not snap if snapping is disabled', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const result = snapManager.snapResizing(rect(100, 100, 100, 40), new Vec2(1, 2), 'None');

            expect(result.delta).toEqual(new Vec2(1, 2));
            expect(result.snapX).toBeUndefined();
        });

        it('should snap right edge to edge of other shape', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const result = snapManager.snapResizing(rect(100, 100, 100, 40), new Vec2(1, 0), 'Shapes', 1, 0);

            expect(result.delta).toEqual(new Vec2(3, 0));
            expect(result.snapX?.value).toEqual(203);
        });

        it('should snap left edge to edge of other shape', () => {
            const snapManager = createManager(shape('a', 50, 700, 46, 40));

            // Left edge is at 100 - 2 = 98, the right edge of the other shape is at 96.
            const result = snapManager.snapResizing(rect(100, 100, 100, 40), new Vec2(2, 0), 'Shapes', -1, 0);

            expect(result.delta).toEqual(new Vec2(4, 0));
            expect(result.snapX?.value).toEqual(96);
        });

        it('should snap bottom and top edges', () => {
            const snapManager = createManager(shape('a', 700, 203, 40, 40));

            const bottom = snapManager.snapResizing(rect(100, 100, 40, 100), new Vec2(0, 1), 'Shapes', 0, 1);

            expect(bottom.delta).toEqual(new Vec2(0, 3));
            expect(bottom.snapY?.value).toEqual(203);

            const top = snapManager.snapResizing(rect(100, 245, 40, 100), new Vec2(0, 0), 'Shapes', 0, -1);

            expect(top.delta).toEqual(new Vec2(0, 2));
            expect(top.snapY?.value).toEqual(243);
        });

        it('should snap to nearest line instead of first line in threshold', () => {
            const snapManager = createManager(
                shape('a', 204, 700, 40, 40),
                shape('b', 201, 800, 60, 40));

            const result = snapManager.snapResizing(rect(100, 100, 100, 40), new Vec2(0, 0), 'Shapes', 1, 0);

            expect(result.delta.x).toEqual(1);
            expect(result.snapX?.value).toEqual(201);
        });

        it('should not snap to center lines', () => {
            const snapManager = createManager(shape('a', 182, 700, 40, 40));

            // The center of the other shape is at 202.
            const result = snapManager.snapResizing(rect(100, 100, 100, 40), new Vec2(0, 0), 'Shapes', 1, 0);

            expect(result.delta.x).toEqual(0);
            expect(result.snapX).toBeUndefined();
        });

        it('should not snap to distance lines', () => {
            const snapManager = createManager(
                shape('a', 100, 100, 50, 50),
                shape('b', 200, 100, 50, 50));

            // The distance line is at 300.
            const result = snapManager.snapResizing(rect(260, 100, 42, 50), new Vec2(0, 0), 'Shapes', 1, 0);

            expect(result.delta.x).toEqual(0);
            expect(result.snapX).toBeUndefined();
        });

        it('should report snap line if edge is already aligned', () => {
            const snapManager = createManager(shape('a', 200, 700, 40, 40));

            const result = snapManager.snapResizing(rect(100, 100, 100, 40), new Vec2(0, 0), 'Shapes', 1, 0);

            expect(result.delta.x).toEqual(0);
            expect(result.snapX?.value).toEqual(200);
        });

        it('should scale threshold with zoom', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            snapManager.setZoom(2);

            const result = snapManager.snapResizing(rect(100, 100, 100, 40), new Vec2(0, 0), 'Shapes', 1, 0);

            expect(result.snapX).toBeUndefined();
        });

        it('should snap dragged right edge to grid', () => {
            const snapManager = createManager();

            // Right edge is at 43 + 10 = 53.
            const result = snapManager.snapResizing(rect(3, 100, 40, 40), new Vec2(10, 0), 'Grid', 1, 0);

            expect(result.delta).toEqual(new Vec2(7, 0));
        });

        it('should snap dragged left edge to grid', () => {
            const snapManager = createManager();

            // Left edge is at 33 - 10 = 23.
            const result = snapManager.snapResizing(rect(33, 100, 40, 40), new Vec2(10, 0), 'Grid', -1, 0);

            expect(result.delta).toEqual(new Vec2(13, 0));
        });

        it('should snap dragged top and bottom edges to grid', () => {
            const snapManager = createManager();

            const bottom = snapManager.snapResizing(rect(100, 3, 40, 40), new Vec2(0, 10), 'Grid', 0, 1);
            const top = snapManager.snapResizing(rect(100, 33, 40, 40), new Vec2(0, 10), 'Grid', 0, -1);

            expect(bottom.delta).toEqual(new Vec2(0, 7));
            expect(top.delta).toEqual(new Vec2(0, 13));
        });

        it('should snap size of rotated shape in grid mode', () => {
            const snapManager = createManager();

            const result = snapManager.snapResizing(rect(100, 100, 40, 40, 45), new Vec2(7, 12), 'Grid');

            expect(result.delta).toEqual(new Vec2(10, 10));
        });

        it('should snap size of rotated shape in shapes mode', () => {
            const snapManager = createManager(shape('a', 203, 700, 40, 40));

            const result = snapManager.snapResizing(rect(100, 100, 40, 40, 45), new Vec2(7, 12), 'Shapes');

            expect(result.delta).toEqual(new Vec2(10, 10));
            expect(result.snapX).toBeUndefined();
        });

        it('should enforce minimum size and remove snap line', () => {
            const snapManager = createManager(shape('a', 99, 700, 20, 40));

            // Right edge is at 140 - 40.5 = 99.5, which would snap to 99 and create a negative size.
            const result = snapManager.snapResizing(rect(100, 100, 40, 40), new Vec2(-40.5, 0), 'Shapes', 1, 0);

            expect(result.delta.x).toEqual(-39);
            expect(result.snapX).toBeUndefined();
        });

        it('should enforce minimum size without snapping', () => {
            const snapManager = createManager();

            const result = snapManager.snapResizing(rect(100, 100, 40, 40), new Vec2(-100, -100), 'None');

            expect(result.delta).toEqual(new Vec2(-39, -39));
        });
    });

    describe('debug lines', () => {
        it('should enrich distance lines with positions', () => {
            const snapManager = createManager(
                shape('a', 100, 100, 50, 50),
                shape('b', 200, 100, 50, 50));

            const { xLines } = snapManager.getDebugLines();

            const distanceLines = xLines.filter(x => x.gridSide);

            expect(distanceLines.length).toEqual(2);
            expect(distanceLines.every(x => !!x.positions && !!x.diff)).toBeTruthy();
        });

        it('should create lines for view and every shape', () => {
            const snapManager = createManager(
                shape('a', 100, 100, 50, 50),
                shape('b', 100, 400, 50, 50));

            const { xLines, yLines } = snapManager.getSnapLines();

            expect(xLines.map(x => x.value)).toEqual([0, 1000, 500, 100, 150, 125, 100, 150, 125]);
            expect(yLines.map(x => x.value)).toEqual([0, 1000, 500, 100, 150, 125, 400, 450, 425, -150, 700]);
        });
    });
});
