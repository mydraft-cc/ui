/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable no-lonely-if */

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';
import { useEventCallback } from '../utils/react';

export function useDetectPrint() {
    const [isPrinting, toggleStatus] = React.useState(false);

    React.useEffect(() => {
        const printMq = window.matchMedia && window.matchMedia('print');

        toggleStatus(!!printMq.matches);

        const eventListener = (mqList: MediaQueryListEvent) => {
            toggleStatus(!!mqList.matches);
        };

        printMq.addEventListener('change', eventListener);

        return () => {
            printMq.removeEventListener('change', eventListener);
        };
    }, []);

    return isPrinting;
}

export function useFullscreen(): [boolean, (value: boolean) => void] {
    const [fullscreen, setFullscreenValue] = React.useState(!!document.fullscreenElement);

    React.useEffect(() => {
        const listener = () => {
            setFullscreenValue(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', listener);

        return () => {
            document.removeEventListener('fullscreenchange', listener);
        };
    }, []);

    const setFullScreen = useEventCallback((value: boolean) => {
        if (value) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
        } else {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    return [fullscreen, setFullScreen];
}

export function usePrinter(): [() => void, () => void, boolean, React.MutableRefObject<any>] {
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [isPrintingReady, setIsPrintingReady] = React.useState(false);
    const printMode = useDetectPrint();
    const printRef = React.useRef<any>();

    const printer = useReactToPrint({
        content: () => printRef.current!,
        onAfterPrint: () => {
            setIsPrinting(false);
            setIsPrintingReady(false);
        },
    });

    React.useEffect(() => {
        if (!printMode) {
            setIsPrinting(false);
        }
    }, [printMode]);

    React.useEffect(() => {
        let timer: any = 0;

        if (isPrintingReady) {
            timer = setTimeout(() => {
                printer && printer();
            }, 2000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isPrintingReady, printer]);

    const doPrint = useEventCallback(() => {
        setIsPrinting(true);
    });

    const doMakeReady = useEventCallback(() => {
        setIsPrintingReady(true);
    });

    return [doPrint, doMakeReady, isPrinting, printRef];
}
