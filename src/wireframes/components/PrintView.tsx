/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { RendererContext } from '@app/context';
import { Diagram, useStore } from '@app/wireframes/model';
import { PrintDiagram } from './PrintDiagram';

export interface PrintRendererProps {
    // True when rendered.
    onRender?: () => void;
}

export const PrintView = (props: PrintRendererProps) => {
    const { onRender } = props;

    const renderedDiagrams = React.useRef<ReadonlyArray<Diagram>>([]);
    const color = useStore(x => x.editor.present.color);
    const diagrams = useStore(x => x.editor.present.diagrams);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);
    const rendered = React.useRef<{ [id: string]: Boolean }>({});
    const renderer = React.useContext(RendererContext);
    const size = useStore(x => x.editor.present.size);

    React.useEffect(() => {
        renderedDiagrams.current = diagramsOrdered;
    }, [diagramsOrdered]);

    const doRender = React.useCallback((diagram: Diagram) => {
        if (rendered.current[diagram.id]) {
            return;
        }

        rendered.current[diagram.id] = true;

        if (Object.keys(rendered.current).length === renderedDiagrams.current.length && onRender) {
            onRender();
        }
    }, [onRender]);

    return (
        <>
            {diagramsOrdered.map((d, i) =>
                <div className='print-diagram' key={i}>
                    <PrintDiagram
                        color={color}
                        diagram={d}
                        diagrams={diagrams}
                        onRender={doRender}
                        rendererService={renderer}
                        size={size}
                    />
                </div>,
            )}
        </>
    );
};
