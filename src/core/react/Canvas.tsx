/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { select, Selection } from 'd3-selection';
import { zoom, ZoomBehavior, ZoomTransform } from 'd3-zoom';
import * as React from 'react';
import { useResizeObserver } from './hooks';

export interface CanvasProps {
    onRender: (viewbox: ViewBox, control: Control) => React.ReactNode;
    contentWidth: number;
    contentHeight: number;
    padding: number;
    className?: string;
}

type Transform = {
    k: number;
    x: number;
    y: number;
};

const DEFAULT_TRANSFORM: Transform = {
    k: 1,
    x: 0,
    y: 0,
};

export type ViewBox = {
    zoom: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

export interface Control {
    reset(): void;
}

const CanvasComponent = React.memo((props: CanvasProps) => {
    const {
        className,
        contentHeight,
        contentWidth,
        onRender,
        padding,
    } = props;

    const canvasRef = React.useRef<HTMLDivElement>(null);
    const { width, height } = useResizeObserver(canvasRef);

    const [transform, setTransform] = React.useState<Transform>(DEFAULT_TRANSFORM);
    const contentHeightRef = React.useRef(contentHeight);
    const contentWidthRef = React.useRef(contentWidth);
    const selectionRef = React.useRef<Selection<HTMLDivElement, unknown, any, any>>();
    const sizeRef = React.useRef({ width, height });
    const zoomRef = React.useRef<ZoomBehavior<HTMLDivElement, unknown>>();

    contentWidthRef.current = contentWidth;
    contentHeightRef.current = contentHeight;

    React.useEffect(() => {
        sizeRef.current = { width, height };
    }, [width, height]);

    React.useEffect(() => {
        const element = canvasRef.current;
        if (!element || zoomRef.current) {
            return;
        }

        const newZoomBehavior = zoom<HTMLDivElement, unknown>()
            .scaleExtent([0.5, 4])
            .filter(event => {
                const e = event as WheelEvent | MouseEvent;
                return e.button === 1 || e.type === 'wheel';
            })
            .on('zoom', ({ transform: d3Transform }: { transform: ZoomTransform }) => {
                const newTransform: Transform = { k: d3Transform.k, x: d3Transform.x, y: d3Transform.y };
                setTransform(newTransform);
            });

        zoomRef.current = newZoomBehavior;

        setExtent(zoomRef.current, contentWidthRef.current, contentHeightRef.current);

        selectionRef.current = select(element);
        selectionRef.current.call(zoomRef.current);
    }, [contentWidth, contentHeight]);

    React.useEffect(() => {
        if (zoomRef.current) {
            setExtent(zoomRef.current, contentWidth, contentHeight);
        }
    }, [contentHeight, contentWidth]);

    const viewBox = React.useMemo(() => {
        const currentZoom = transform.k;
        const w = width ?? 0;
        const h = height ?? 0;

        return {
            minX: round(-transform.x / currentZoom),
            minY: round(-transform.y / currentZoom),
            maxX: round(w / currentZoom),
            maxY: round(h / currentZoom),
            zoom: currentZoom,
        };
    }, [transform, width, height]);

    const control = React.useMemo(() => {
        return {
            reset: () => {
                const s = sizeRef.current;
                const currentWidth = s.width;
                const currentHeight = s.height;

                if (!zoomRef.current || !selectionRef.current || currentWidth === undefined || currentHeight === undefined || currentWidth === 0 || currentHeight === 0) {
                    return;
                }

                const targetW = currentWidth - 2 * padding;
                const targetH = currentHeight - 2 * padding;

                const cw = contentWidthRef.current;
                const ch = contentHeightRef.current;

                if (cw === 0 || ch === 0) {
                    return;
                }

                const zoomX = targetW / cw;
                const zoomY = targetH / ch;

                const k = Math.max(0.01, Math.min(zoomX, zoomY));

                const x = (currentWidth - k * cw) / 2;
                const y = (currentHeight - k * ch) / 2;

                const newTransform = new ZoomTransform(k, x, y);

                zoomRef.current.transform(selectionRef.current, newTransform);
            },
        };
    }, [padding, contentWidth, contentHeight]);

    React.useEffect(() => {
        if (zoomRef.current && selectionRef.current) {
            if (width !== undefined && height !== undefined) {
                control.reset();
            }
        }
    }, [control, width, height]);

    return (
        <div className={className} ref={canvasRef}>
            {(width !== undefined && height !== undefined) && onRender(viewBox, control)}
        </div>
    );
});

function setExtent(zoom: ZoomBehavior<HTMLDivElement, unknown> | undefined, width: number, height: number) {
    if (!zoom) {
        return;
    }

    const overlapX = width * 0.4;
    const overlapY = height * 0.4;

    zoom.translateExtent([[-overlapX, -overlapY], [width + overlapX, height + overlapY]]);
}

function round(source: number) {
    return parseFloat(source.toFixed(2));
}

export const Canvas = CanvasComponent;