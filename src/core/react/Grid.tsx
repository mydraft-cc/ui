/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { sizeInPx } from '@app/core/utils';
import { useEventCallback } from './hooks';
import useResizeObserver from '../../hooks/useResizeObserver';

interface GridProps {
    // The items to render.
    items: any[];

    // The number of columns.
    columns: number;

    // The class name for the list.
    className?: string;

    // The renderer.
    renderer: (item: any) => JSX.Element;

    // Retrieves the key for caching.
    keyBuilder: (item: any) => string;
}

interface GridLayoutParams {
    cellSize: number;
    indexFirst: number;
    indexLast: number;
    height: number;
}

const cache: { [key: string]: JSX.Element } = {};

export const GridList = React.memo((props: GridProps & GridLayoutParams) => {
    const {
        cellSize,
        indexFirst,
        indexLast,
        columns,
        height,
        items,
        keyBuilder,
        renderer,
    } = props;

    const cells = [];

    if (renderer) {
        // Use indexFirst and indexLast from props for virtual rendering
        for (let index = indexFirst; index < indexLast; index++) {
            const item = items[index];

            if (item) {
                const itemKey = keyBuilder(item);

                let cell = cache[itemKey];

                if (!cell) {
                    cell = renderer(item);

                    cache[itemKey] = cell;
                }

                const col = sizeInPx(cellSize * Math.floor(index % columns));
                const row = sizeInPx(cellSize * Math.floor(index / columns));

                const cellPx = sizeInPx(cellSize);

                cell = (
                    <div key={index} style={{ position: 'absolute', height: cellPx, width: cellPx, top: row, left: col }}>
                        {cell}
                    </div>
                );

                cells.push(cell);
            }
        }
    }

    return (
        <div style={{ height: sizeInPx(height), position: 'relative' }}>
            {cells}
        </div>
    );
});

const GridComponent = (props: GridProps) => {
    const {
        className,
        columns,
        items,
    } = props;

    const gridRef = React.useRef<HTMLDivElement>(null);
    const { width, height } = useResizeObserver(gridRef);

    const [scrollTop, setScrollTop] = React.useState(0);

    const doScroll = useEventCallback((event: React.UIEvent<HTMLDivElement>) => {
        const div = event.target as HTMLDivElement;

        setScrollTop(div.scrollTop);
    });

    const layout = React.useMemo(() => {
        if (width === undefined || height === undefined) {
            return { cellSize: 0, indexFirst: 0, indexLast: 0, height: 0 };
        }

        let containerWidth = width;

        if (containerWidth === 0) {
            return { cellSize: 0, indexFirst: 0, indexLast: 0, height: 0 };
        }

        containerWidth -= 1;

        const cellSize = Math.floor(containerWidth / columns);

        const numRows = columns > 0 ? Math.ceil(items.length / columns) : 0;
        const scrollContentHeight = cellSize * numRows;

        const scrollBottom = height + scrollTop;

        const indexFirst = cellSize > 0 ? Math.floor(scrollTop / cellSize) * columns : 0;
        const indexLast = cellSize > 0 ? Math.floor(scrollBottom / cellSize) * columns + columns * 2 : 0;

        return { cellSize, indexFirst, indexLast, height: scrollContentHeight };
    }, [columns, items.length, scrollTop, width, height]);

    return (
        <div className={className} onScroll={doScroll} ref={gridRef}>
            <GridList {...props} {...layout} />
        </div>
    );
};

export const Grid = GridComponent;
