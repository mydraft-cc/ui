import * as React from 'react';

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

const size = (value: number) => {
    return `${value}px`;
};

export class Grid extends React.Component<GridProps, GridState> {
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
        this.calculateIndex();
    }

    public shouldComponentUpdate(nextProps: GridProps, nextState: GridState) {
        const next = {...nextProps, ...nextState};
        const curr = {...this.props, ...this.state};

        for (let key in next) {
            if (next[key] !== curr[key]) {
                return true;
            }
        }

        return false;
    }

    private initialize(element: HTMLElement) {
        if (element && !this.isInitialized) {
            this.container = element;

            this.calculateIndex();

            this.isInitialized = true;
        }
    }

    private onScroll = (element: UIEvent) => {
        if (this.container === element.target) {
            this.calculateIndex();
        }
    }

    private calculateIndex() {
        const itemSize = (310 || 0) / this.props.columns;
        const itemsHeight = itemSize * this.props.items.length / this.props.columns;

        const scrollTop = this.container.scrollTop;
        const scrollBottom = this.container.getBoundingClientRect().height + scrollTop;

        const indexFirst = Math.floor(scrollTop / itemSize) * this.props.columns;
        const indexLast  = Math.floor(scrollBottom / itemSize) * this.props.columns + this.props.columns * 2;

        this.setState({ cellSize: itemSize, indexFirst: indexFirst, indexLast: indexLast, height: itemsHeight });
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
                <div key={index} style={{ position: 'absolute', height: size(dim), width: size(dim), top: size(row * dim), left: size(col * dim + 1) }}>
                    {element}
                </div>
            );

            items.push(element);
        }

        return items;
    }

    public render() {
        return (
            <div className={this.props.className} ref={element => this.initialize(element!)}>
                <div style={{ height: size(this.state.height), position: 'relative' }}>
                    {this.renderItems()}
                </div>
            </div>
        );
    }
}