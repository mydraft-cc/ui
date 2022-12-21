/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ArrowLeftOutlined, ArrowRightOutlined, CloseOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';
import { sizeInPx, useEventCallback, useFullscreen } from '@app/core';
import { getPageLinkId, isPageLink } from '@app/wireframes/interface';
import { useStore } from '@app/wireframes/model';
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
    const size = useStore(x => x.editor.present.size);
    const [pageIndex, setPageIndex] = React.useState(0);

    const doGoPrev = useEventCallback(() => {
        setPageIndex(x => x - 1);
    });

    const doGoNext = useEventCallback(() => {
        setPageIndex(x => x + 1);
    });

    const doFullscreenEnter = useEventCallback(() => {
        setFullscreen(true);
    });

    const doFullscreenExit = useEventCallback(() => {
        setFullscreen(false);
    });

    const doNavigate = useEventCallback((_, link: string) => {
        if (isPageLink(link)) {
            const linkId = getPageLinkId(link);
            const linkIndex = diagramsOrdered.findIndex(x => x.id === linkId);

            if (linkIndex >= 0) {
                setPageIndex(linkIndex);
            }
        } else {
            window.open(link, '_blank');
        }
    });

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
                            onNavigate={doNavigate}
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
