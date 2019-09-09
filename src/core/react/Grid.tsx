import * as React from 'react';
import Measurer from 'react-measure';

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

export class Grid extends React.PureComponent<GridProps, GridState> {
    private cache: { [key: string]:  JSX.Element } = {};
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

    private measure = () => {
        const { columns, items } = this.props;

        const cellSize = this.container.scrollWidth / columns;

        const height = cellSize * items.length / columns;

        const scrollTop = this.container.scrollTop;
        const scrollBottom = this.container.getBoundingClientRect().height + scrollTop;

        const indexFirst = Math.floor(scrollTop / cellSize) * columns;
        const indexLast  = Math.floor(scrollBottom / cellSize) * columns + columns * 2;

        this.setState({ cellSize, indexFirst, indexLast, height });
    }

    private renderItems(): JSX.Element[] {
        const {
            cellSize,
            indexFirst,
            indexLast
        } = this.state;

        const {
            columns,
            items,
            keyBuilder,
            renderer
        } = this.props;

        const cells = [];

        for (let index = indexFirst; index < indexLast; index++) {
            const item = items[index];

            if (!item) {
                continue;
            }

            let cell = this.renderCell(keyBuilder, item, renderer);

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

        return cells;
    }

    private renderCell(keyBuilder: (item: any) => string, item: any, renderer: (item: any) => JSX.Element) {
        const itemKey = keyBuilder(item);

        let cell = this.cache[itemKey];

        if (!cell) {
            cell = renderer(item);

            this.cache[itemKey] = cell;
        }

        return cell;
    }

    public render() {
        const { className } = this.props;

        return (
            <Measurer onResize={this.measure}>
                {({ measureRef }) =>
                    <div className={className} ref={element => this.initialize(element, measureRef)} onScroll={this.scroll}>
                        <div style={{ height: sizeInPx(this.state.height), position: 'relative' }}>
                            {this.renderItems()}
                        </div>
                    </div>
                }
            </Measurer>
        );
    }
}