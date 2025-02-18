/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { select, Selection } from 'd3-selection';
import { zoom, ZoomBehavior, ZoomTransform } from 'd3-zoom';
import * as React from 'react';
import { SizeMeProps, withSize } from 'react-sizeme';

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

const CanvasComponent = React.memo((props: SizeMeProps & CanvasProps) => {
    const {
        className,
        contentHeight,
        contentWidth,
        onRender,
        padding,
        size,
    } = props;

    const [transform, setTransform] = React.useState<Transform>(DEFAULT_TRANSFORM);
    const contentHeightRef = React.useRef(contentHeight);
    const contentWidthRef = React.useRef(contentWidth);
    const selectionRef = React.useRef<Selection<HTMLDivElement, unknown, any, any>>();
    const sizeRef = React.useRef(size);
    const zoomRef = React.useRef<ZoomBehavior<Element, unknown>>();

    contentWidthRef.current = contentWidth;
    contentHeightRef.current = contentHeight;
    sizeRef.current = size;
    
    const doInit = React.useCallback((container: HTMLDivElement) => {
        if (!container) {
            return;
        }

        zoomRef.current = zoom()
            .scaleExtent([0.5, 4])
            .filter(event => {
                return event.button === 1 || event.type === 'wheel';
            })
            .on('zoom', ({ transform }: { transform: Transform }) => {
                setTransform(transform);
            });

        setExtent(zoomRef.current, contentWidthRef.current, contentHeightRef.current);

        selectionRef.current = select(container);
        selectionRef.current.call(zoomRef.current as any);
    }, []);

    React.useMemo(() => {
        setExtent(zoomRef.current, contentWidth, contentHeight);
    }, [contentHeight, contentWidth]);

    const viewBox = React.useMemo(() => {
        const zoom = transform.k;
        const w = size.width || 0;
        const h = size.height || 0;

        return {
            minX: round(-transform.x / zoom),
            minY: round(-transform.y / zoom),
            maxX: round(w / zoom),
            maxY: round(h / zoom),
            zoom: zoom,
        };
    }, [transform, size]);

    const control = React.useMemo(() => {
        return {
            reset: () => {
                const s = sizeRef.current;
        
                const targetW = s.width! - 2 * padding;
                const targetH = s.height! - 2 * padding;
        
                const zoomX = targetW / contentWidth;
                const zoomY = targetH / contentHeight;
        
                const k = Math.min(zoomX, zoomY);
        
                const x = (targetW - k * contentWidth) / 2 + padding;
                const y = (targetH - k * contentHeight) / 2 + padding;
        
                zoomRef.current?.transform(selectionRef.current as any, new ZoomTransform(k, x, y));
            },
        };
    }, [contentHeight, contentWidth, padding]);

    React.useEffect(() => {
        control.reset();
    }, [control]);
    
    return (
        <div className={className} ref={doInit}>
            {onRender(viewBox, control)}
        </div>
    );
});

function setExtent(zoom: ZoomBehavior<Element, unknown> | undefined, width: number, height: number) {
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

export const Canvas = withSize({ monitorHeight: true, monitorWidth: true })(CanvasComponent);