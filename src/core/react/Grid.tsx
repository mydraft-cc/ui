/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { SizeMeProps, withSize } from 'react-sizeme';
import { sizeInPx } from './../utils/react';

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

interface GridState {
    // The first index to render.
    indexFirst: number;

    // The last index to render.
    indexLast: number;

    // The height of all items.
    height: number;

    // The size of each cell.
    cellSize: number;
}

const cache: { [key: string]: JSX.Element } = {};

export const GridList = React.memo((props: GridProps & GridState) => {
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

    return (
        <div style={{ height: sizeInPx(height), position: 'relative' }}>
            {...cells}
        </div>
    );
});

const GridComponent = (props: SizeMeProps & GridProps) => {
    const {
        className,
        columns,
        items,
        size,
    } = props;

    const [scrollTop, setScrollTop] = React.useState(0);
    const [scrollContainer, setScrollContainer] = React.useState<HTMLDivElement | null>();

    const doScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const div: HTMLDivElement = event.target as any;

        setScrollTop(div.scrollTop);
    }, []);

    const layout = React.useMemo(() => {
        if (!scrollContainer || !size || size.height === null) {
            return { cellSize: 0, indexFirst: 0, indexLast: 0, height: 0 };
        }

        const cellSize = Math.floor((scrollContainer.scrollWidth - 1) / columns);

        const height = cellSize * items.length / columns;

        const scrollBottom = size.height + scrollTop;

        const indexFirst = Math.floor(scrollTop / cellSize) * columns;
        const indexLast = Math.floor(scrollBottom / cellSize) * columns + columns * 2;

        return { cellSize, indexFirst, indexLast, height };
    }, [columns, items.length, scrollTop, scrollContainer, size]);

    return (
        <div className={className} onScroll={doScroll} ref={setScrollContainer}>
            <GridList {...props} {...layout} />
        </div>
    );
};

export const Grid = withSize({ monitorHeight: true })(GridComponent);
