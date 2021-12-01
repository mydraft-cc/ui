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

    const [currentDiagrams, setCurrentDiagrams] = React.useState<Diagram[]>([]);
    const diagrams = useStore(x => x.editor.present.diagrams);
    const rendered = React.useRef<PrintState>({});
    const renderer = React.useContext(RendererContext);
    const size = useStore(x => x.editor.present.size);

    React.useEffect(() => {
        setCurrentDiagrams(diagrams.values);
    }, [diagrams.values]);

    const doRender = React.useCallback((diagram: Diagram) => {
        rendered.current[diagram.id] = true;

        if (Object.keys(rendered.current).length === currentDiagrams.length && onRender) {
            onRender();
        }
    }, [currentDiagrams.length, onRender]);

    return (
        <>
            {currentDiagrams.map((d, i) =>
                <div key={i}>
                    <PrintDiagram size={size} diagram={d} rendererService={renderer} onRender={doRender} />
                </div>,
            )}
        </>
    );
};
