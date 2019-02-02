import * as React from 'react';
import Measurer from 'react-measure';

import { sizeInPx } from '@app/core';

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
    private isInitialized = false;

    constructor(props: GridProps) {
        super(props);

        this.state = { cellSize: 0, indexFirst: 0, indexLast: 0, height: 0 };
    }

    public componentDidMount() {
        window.addEventListener('scroll', this.onScroll, true);
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll);
    }

    public componentWillReceiveProps() {
        this.measure();
    }

    private initialize(element: HTMLElement) {
        if (element && !this.isInitialized) {
            this.container = element;

            this.measure();

            this.isInitialized = true;
        }
    }

    private onScroll = (element: UIEvent) => {
        if (this.container === element.target) {
            this.measure();
        }
    }

    private measure() {
        const columns = this.props.columns;

        const itemSize = this.container.scrollWidth / columns;
        const itemsHeight = itemSize * this.props.items.length / columns;

        const scrollTop = this.container.scrollTop;
        const scrollBottom = this.container.getBoundingClientRect().height + scrollTop;

        const indexFirst = Math.floor(scrollTop / itemSize) * columns;
        const indexLast  = Math.floor(scrollBottom / itemSize) * columns + columns * 2;

        const state = this.state;

        if (state.cellSize !== itemSize ||
            state.indexFirst !== indexFirst ||
            state.indexLast !== indexLast ||
            state.height !== itemsHeight) {
            this.setState({ cellSize: itemSize, indexFirst: indexFirst, indexLast: indexLast, height: itemsHeight });
        }
    }

    private renderItems(): JSX.Element[] {
        const cellSize = this.state.cellSize;

        const items = [];

        for (let index = this.state.indexFirst; index < this.state.indexLast; index++) {
            const item = this.props.items[index];

            if (!item) {
                continue;
            }

            const itemKey = this.props.keyBuilder(item);

            let element = this.cache[itemKey];

            if (!element) {
                element = this.props.renderer(item);

                this.cache[itemKey] = element;
            }

            const dim = cellSize;

            const col = Math.floor(index % this.props.columns);
            const row = Math.floor(index / this.props.columns);

            element = (
                <div key={index} style={{ position: 'absolute', height: sizeInPx(dim), width: sizeInPx(dim), top: sizeInPx(row * dim), left: sizeInPx(col * dim) }}>
                    {element}
                </div>
            );

            items.push(element);
        }

        return items;
    }

    public render() {
        const { className } = this.props;

        return (
            <Measurer onResize={() => this.measure()}>
                {({ measureRef }) =>
                    <div className={className} ref={element => { this.initialize(element!); measureRef(element); }}>
                        <div style={{ height: sizeInPx(this.state.height), position: 'relative' }}>
                            {this.renderItems()}
                        </div>
                    </div>
                }
            </Measurer>
        );
    }
}