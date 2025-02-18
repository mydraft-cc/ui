/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable no-lonely-if */

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';

export function useOpenFile(fileType: string, onOpened: (file: File) => void): () => void {
    const fileInputRef = React.useRef<HTMLInputElement | null>();
    const fileCallback = React.useRef(onOpened);

    React.useEffect(() => {
        let invisibleInput = document.createElement('input');
        invisibleInput.type = 'file';
        invisibleInput.style.visibility = 'hidden';
        invisibleInput.accept = fileType;
    
        invisibleInput.addEventListener('change', () => {
            if (invisibleInput.files && invisibleInput.files.length > 0) {
                const file = invisibleInput.files[0];

                fileCallback.current(file);
            }
        });

        document.body.appendChild(invisibleInput);

        fileInputRef.current = invisibleInput;
        
        return () => {
            document.body.removeChild(invisibleInput);

            fileInputRef.current = null;
        };
    }, [fileType]);

    React.useEffect(() => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = fileType;
        }
    }, [fileType]);

    const doClick = useEventCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    });

    return doClick;
}

export function useDetectPrint(): boolean {
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

export const useDocumentEvent = <K extends keyof DocumentEventMap>(type: K, listener: (event: DocumentEventMap[K]) => any) => {
    const listenerRef = React.useRef(listener);

    listenerRef.current = listener;

    React.useEffect(() => {
        const callback = (event: any) => {
            listenerRef.current(event);
        };

        document.addEventListener(type, callback);

        return () => {
            document.removeEventListener(type, callback);
        };
    }, [type]);
};

export const useWindowEvent = <K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => any) => {
    const listenerRef = React.useRef(listener);

    listenerRef.current = listener;

    React.useEffect(() => {
        const callback = (event: any) => {
            listenerRef.current(event);
        };

        window.addEventListener(type, callback);

        return () => {
            window.removeEventListener(type, callback);
        };
    }, [type]);
};

type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

export const useEventCallback = <A extends any[], R>(fn: Fn<A, R>): Fn<A, R> => {
    let ref = React.useRef<Fn<A, R>>(fn);

    React.useLayoutEffect(() => {
        ref.current = fn;
    });

    return React.useMemo(() => (...args: A): R => {
        return ref.current(...args);
    }, []);
};

export const useCurrentRef = <T>(value: T) => {
    let ref = React.useRef<T>(value);

    React.useLayoutEffect(() => {
        ref.current = value;
    });

    return ref;
};