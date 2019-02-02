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
        const { zoom, zoomedHeight, zoomedWidth } = props;

        if (this.document) {
            const w = zoomedWidth / zoom;
            const h = zoomedHeight / zoom;

            this.document.style({ width: sizeInPx(w), height: sizeInPx(h), overflow: 'visible' });

            this.document.untransform();
            this.document.scale(zoom, zoom, 0, 0);

            this.document.translate(
                0.5 * (zoomedWidth -  w),
                0.5 * (zoomedHeight - h));

            this.document.show();
        }
    }

    public render() {
        return <div className={this.props.className} ref={this.initialize} />;
    }
}