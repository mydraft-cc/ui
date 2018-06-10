
import * as React from 'react';
import * as svg from 'svg.js';

export interface CanvasViewProps {
    // The width of the canvas.
    zoomedWidth: number;

    // The height of the canvas.
    zoomedHeight: number;

    // The zoom value of the canvas.
    zoom: number;

    // The class name.
    className?: string;

    // The callback when the canvas has been initialized.
    onInit: (scope: svg.Doc) => any;
}

export class CanvasView extends React.Component<CanvasViewProps> {
    private docElement: any;
    private doc: svg.Doc;

    public initialize(canvas: any) {
        this.docElement = canvas;

        if (canvas) {
            this.doc = svg(this.docElement);

            this.updateViewSettings(this.props);

            this.props.onInit(this.doc);
        }
    }

    public componentWillReceiveProps(nextProps: CanvasViewProps) {
        this.updateViewSettings(nextProps);
    }

    public shouldComponentUpdate() {
        return false;
    }

    private updateViewSettings(props: CanvasViewProps) {
        if (this.doc) {
            this.doc.style({ width: props.zoomedWidth + 'px', height: props.zoomedHeight + 'px'});
        }
    }

    public render() {
        return <div className={this.props.className} ref={canvas => this.initialize(canvas)} />;
    }
}