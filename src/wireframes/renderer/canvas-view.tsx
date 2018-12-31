import * as React from 'react';
import * as svg from 'svg.js';

import { sizeInPx } from '@app/core';

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
    private document: svg.Doc;

    private initialize = (element: any) => {
        this.docElement = element;

        if (element) {
            this.document = svg(this.docElement);

            this.updateViewSettings(this.props);

            this.props.onInit(this.document);
        }
    }

    public componentWillReceiveProps(nextProps: CanvasViewProps) {
        this.updateViewSettings(nextProps);
    }

    public shouldComponentUpdate() {
        return false;
    }

    private updateViewSettings(props: CanvasViewProps) {
        if (this.document) {
            const w = props.zoomedWidth / props.zoom;
            const h = props.zoomedHeight / props.zoom;

            this.document.style({ width: sizeInPx(w), height: sizeInPx(h), overflow: 'visible' });

            this.document.untransform();
            this.document.scale(
                props.zoom,
                props.zoom, 0, 0);

            this.document.translate(
                0.5 * (props.zoomedWidth -  w),
                0.5 * (props.zoomedHeight - h));

            this.document.show();
        }
    }

    public render() {
        return <div className={this.props.className} ref={this.initialize} />;
    }
}