/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ArrowLeftOutlined, ArrowRightOutlined, CloseOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { RendererContext } from '@app/context';
import { sizeInPx, useFullscreen } from '@app/core';
import { useStore } from '@app/wireframes/model';
import { Button } from 'antd';
import * as React from 'react';
import { PrintDiagram } from './PrintDiagram';
import './PresentationView.scss';

export interface PresentationViewProps {
    // True when rendered.
    onClose: () => void;
}

export const PresentationView = (props: PresentationViewProps) => {
    const { onClose } = props;

    const [fullscreen, setFullscreen] = useFullscreen();
    const color = useStore(x => x.editor.present.color);
    const diagrams = useStore(x => x.editor.present.diagrams);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);
    const renderer = React.useContext(RendererContext);
    const size = useStore(x => x.editor.present.size);
    const [pageIndex, setPageIndex] = React.useState(0);

    const doGoPrev = React.useCallback(() => {
        setPageIndex(pageIndex - 1);
    }, [pageIndex]);

    const doGoNext = React.useCallback(() => {
        setPageIndex(pageIndex + 1);
    }, [pageIndex]);

    const doFullscreenEnter = React.useCallback(() => {
        setFullscreen(true);
    }, []);

    const doFullscreenExit = React.useCallback(() => {
        setFullscreen(false);
    }, []);

    const currentDiagram = React.useMemo(() => {
        return diagramsOrdered[pageIndex];
    }, [pageIndex, diagramsOrdered]);

    const w = sizeInPx(size.x);
    const h = sizeInPx(size.y);

    return (
        <>
            <div className='presentation-view'>
                {currentDiagram &&
                    <div className='presentation-diagram' style={{ width: w, height: h }}>
                        <PrintDiagram
                            color={color}
                            diagram={currentDiagram}
                            diagrams={diagrams}
                            rendererService={renderer}
                            size={size}
                        />
                    </div>
                }

                <div className='presentation-tools'>
                    <Button onClick={doGoPrev} disabled={pageIndex === 0}>
                        <ArrowLeftOutlined />
                    </Button>

                    <Button onClick={doGoNext} disabled={pageIndex >= diagramsOrdered.length - 1}>
                        <ArrowRightOutlined />
                    </Button>

                    <Button onClick={onClose}>
                        <CloseOutlined />
                    </Button>

                    {!fullscreen ? (
                        <Button onClick={doFullscreenEnter}>
                            <FullscreenOutlined />
                        </Button>
                    ) : (
                        <Button onClick={doFullscreenExit}>
                            <FullscreenExitOutlined />
                        </Button>
                    )}
                </div>
            </div>,
        </>
    );
};
