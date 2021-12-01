/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';

export function useDetectPrint() {
    const [isPrinting, toggleStatus] = React.useState(false);

    React.useEffect(() => {
        const printMq = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print');

        toggleStatus(!!printMq.matches);

        const eventListener = (mqList: MediaQueryListEvent) => {
            toggleStatus(!!mqList.matches);
        };

        printMq.addEventListener('change', eventListener);

        return () => {
            printMq.removeEventListener('change', eventListener);
        };
    }, []);

    React.useEffect(() => {
        // eslint-disable-next-line no-console
        console.log(`PRINTING: ${isPrinting}`);
    }, [isPrinting]);

    return isPrinting;
}

export function usePrinter(): [() => void, () => void, boolean, React.MutableRefObject<undefined>] {
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [isPrintingReady, setIsPrintingReady] = React.useState(false);
    const printMode = useDetectPrint();
    const printRef = React.useRef();

    const printer = useReactToPrint({
        content: () => printRef.current,
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
                printer();
            }, 2000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isPrintingReady, printer]);

    const doPrint = React.useCallback(() => {
        setIsPrinting(true);
    }, []);

    const doMakeReady = React.useCallback(() => {
        setIsPrintingReady(true);
    }, []);

    return [doPrint, doMakeReady, isPrinting, printRef];
}
