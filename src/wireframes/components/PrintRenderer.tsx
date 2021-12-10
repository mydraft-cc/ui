/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { RendererContext } from '@app/context';
import { Diagram, useStore } from '@app/wireframes/model';
import * as React from 'react';
import { PrintDiagram } from './PrintDiagram';

export interface PrintRendererProps {
    // True when rendered.
    onRender?: () => void;
}

type PrintState = { [id: string]: Boolean };

export const PrintRenderer = (props: PrintRendererProps) => {
    const { onRender } = props;

    const currentDiagrams = React.useRef<Diagram[]>([]);
    const diagrams = useStore(x => x.editor.present.diagrams);
    const color = useStore(x => x.editor.present.color);
    const rendered = React.useRef<PrintState>({});
    const renderer = React.useContext(RendererContext);
    const size = useStore(x => x.editor.present.size);

    React.useEffect(() => {
        currentDiagrams.current = diagrams.values;
    }, [diagrams.values]);

    const doRender = React.useCallback((diagram: Diagram) => {
        if (rendered.current[diagram.id]) {
            return;
        }

        rendered.current[diagram.id] = true;

        if (Object.keys(rendered.current).length === currentDiagrams.current.length && onRender) {
            onRender();
        }
    }, [onRender]);

    return (
        <>
            {diagrams.values.map((d, i) =>
                <div key={i}>
                    <PrintDiagram size={size} color={color} diagram={d} rendererService={renderer} onRender={doRender} />
                </div>,
            )}
        </>
    );
};
