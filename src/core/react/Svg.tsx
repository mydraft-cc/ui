/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Vec2 } from '@app/core';
import * as React from 'react';
import * as svg from 'svg.js';

export interface SvgProps {
    // The zoomed width of the canvas.
    size?: Vec2;

    // The optional viewbox.
    viewBox?: Rect2;

    // The view size.
    viewSize?: Vec2;

    // The class name.
    className?: string;

    // The callback when the canvas has been initialized.
    onInit: (scope: svg.Doc) => any;
}

export const Svg = (props: SvgProps) => {
    const {
        className,
        onInit,
        size,
        viewBox,
    } = props;

    const [document, setDocument] = React.useState<svg.Doc>();

    const ref = React.useRef();

    React.useLayoutEffect(() => {
        const element = ref.current;

        if (element && !document) {
            const newDocument = svg(element).style({ position: 'relative', overflow: 'visible' });

            onInit(newDocument);

            setDocument(newDocument);
        }
    }, [ref.current, setDocument]);

    React.useLayoutEffect(() => {
        if (document && viewBox) {
            document.viewbox(viewBox.x, viewBox.y, viewBox.w, viewBox.h);
        }
    }, [document, viewBox]);

    React.useLayoutEffect(() => {
        if (document && size) {
            document.size(size.x, size.y);
        }
    }, [document, size]);

    return <div className={className} ref={ref} />;
};
