/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useEventCallback } from '@app/core';
import { Diagram, useStore } from '@app/wireframes/model';
import { PrintDiagram } from './PrintDiagram';

export interface PrintRendererProps {
    // True when rendered.
    onRender?: () => void;
}

export const PrintView = (props: PrintRendererProps) => {
    const { onRender } = props;

    const color = useStore(x => x.editor.present.color);
    const diagrams = useStore(x => x.editor.present.diagrams);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);
    const renderTargets = React.useRef<ReadonlyArray<Diagram>>([]);
    const renderConfirms = React.useRef(new Set<string>());
    const size = useStore(x => x.editor.present.size);

    React.useEffect(() => {
        renderTargets.current = diagramsOrdered;
    }, [diagramsOrdered]);

    const doRender = useEventCallback((diagram: Diagram) => {
        renderConfirms.current.add(diagram.id);

        if (renderConfirms.current.size === renderTargets.current.length) {
            onRender?.();
        }
    });

    return (
        <>
            {diagramsOrdered.map((d, i) =>
                <div className='print-diagram' key={i}>
                    <PrintDiagram
                        color={color}
                        diagram={d}
                        diagrams={diagrams}
                        onRender={doRender}
                        size={size}
                    />
                </div>,
            )}
        </>
    );
};
