import * as React from 'react';
import Measurer, { ContentRect } from 'react-measure';

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

const cache: { [key: string]:  JSX.Element } = {};

export const GridList = React.memo((props: GridProps & GridState) => {
    const {
        cellSize,
        indexFirst,
        indexLast,
        columns,
        height,
        items,
        keyBuilder,
        renderer
    } = props;

    const cells = [];

    for (let index = indexFirst; index < indexLast; index++) {
        const item = items[index];

        if (!item) {
            continue;
        }

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

    return (
        <div style={{ height: sizeInPx(height), position: 'relative' }}>
            {...cells}
        </div>
    );
});

export class Grid extends React.PureComponent<GridProps, GridState> {
    private container: HTMLElement;

    constructor(props: GridProps) {
        super(props);

        this.state = { cellSize: 0, indexFirst: 0, indexLast: 0, height: 0 };
    }

    public componentDidUpdate() {
        this.measure();
    }

    private initialize(element: HTMLElement, forward: (element: HTMLElement) => void) {
        forward(element);

        if (!this.container) {
            this.container = element;

            this.measure();
        }
    }

    private measure = (rect?: ContentRect) => {
        const { columns, items } = this.props;

        let containerHeight = 0;

        if (rect && rect.entry) {
            containerHeight = rect.entry.height;
        } else {
            containerHeight = this.container.getBoundingClientRect().height;
        }

        const cellSize = this.container.scrollWidth / columns;

        const height = cellSize * items.length / columns;

        const scrollTop = this.container.scrollTop;
        const scrollBottom = containerHeight + scrollTop;

        const indexFirst = Math.floor(scrollTop / cellSize) * columns;
        const indexLast  = Math.floor(scrollBottom / cellSize) * columns + columns * 2;

        const state = this.state;

        if (state.cellSize !== cellSize ||
            state.indexFirst !== indexFirst ||
            state.indexLast !== indexLast ||
            state.height !== height) {
            this.setState({ cellSize, indexFirst, indexLast, height });
        }
    }

    public render() {
        const { className } = this.props;

        return (
            <Measurer onResize={this.measure}>
                {({ measureRef }) =>
                    <div className={className} ref={element => this.initialize(element, measureRef)}>
                        <GridList {...this.props} {...this.state} />
                    </div>
                }
            </Measurer>
        );
    }
}