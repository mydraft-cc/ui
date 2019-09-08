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

export const CanvasView = (props: CanvasViewProps) => {
    const {
        className,
        onInit,
        zoom,
        zoomedHeight,
        zoomedWidth
    } = props;

    let [document, setDocument] = React.useState<svg.Doc>();

    const ref = React.useRef();

    React.useLayoutEffect(() => {
        const element = ref.current;

        if (element && !document) {
            document = svg(element);
            document.style({ position: 'relative', overflow: 'visible' });

            onInit(document);

            setDocument(document);
        }
    }, [ref.current, setDocument]);

    React.useLayoutEffect(() => {
        if (document) {
            const w = zoomedWidth / zoom;
            const h = zoomedHeight / zoom;

            document.size(zoomedWidth, zoomedHeight).viewbox(0, 0, w, h);
        }
    }, [ref.current, zoom, zoomedHeight, zoomedWidth, document]);

    return <div className={className} ref={ref} />;
};