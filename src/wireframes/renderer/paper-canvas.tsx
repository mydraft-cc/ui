import * as React from 'react';
import * as paper from 'paper';

export interface PaperCanvasProps {
    // The width of the canvas.
    width: number;

    // The height of the canvas.
    height: number;

    // The zoom value of the canvas.
    zoom: number;

    // The class name.
    className?: string;

    // The callback when the canvas has been initialized.
    onInit: (scope: paper.PaperScope) => any;
}

export class PaperCanvas extends React.Component<PaperCanvasProps, {}> {
    private canvasElement: any;
    private scope: paper.PaperScope;

    public componentWillMount() {
        setTimeout(() => {
            this.updateViewSettings();
                this.scope = new paper.PaperScope();
                this.scope.setup(this.canvasElement);

                this.props.onInit(this.scope);

                this.updateViewSettings();
        });
    }

    public componentDidUpdate() {
        this.updateViewSettings();
    }

    private updateViewSettings() {
        if (this.scope) {
            this.scope.view.viewSize = new paper.Size(this.props.width, this.props.height);

            this.scope.view.center =
                new paper.Point(
                    0.5 / this.props.zoom * this.props.width,
                    0.5 / this.props.zoom * this.props.height);
            this.scope.view['matrix'] = new paper.Matrix(this.props.zoom, 0, 0, this.props.zoom, 0, 0);
        }
    }

    public render() {
        return <canvas className={this.props.className} ref={canvas => { this.canvasElement = canvas; }} />;
    }
}