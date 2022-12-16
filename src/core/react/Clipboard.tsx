/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Types } from './../utils/types';
import { useDocumentEvent } from './hooks';

export interface ClipboardCopyEvent {
    // Indicates whether the event type is a cut event.
    isCut: boolean;

    // Access to the clipboard.
    clipboard: ClipboardInstance;
}

export interface ClipboadTextEvent {
    type: 'Text';

    // The text when the clipboard contains a text value.
    text: string;
}

export interface ClipboardFileEvent {
    type: 'Image';

    // The loaded image when the clipboard contains a file value.
    images: LoadedImage[];
}

export type ClipboardPasteEvent = ClipboardFileEvent | ClipboadTextEvent;

class ClipboardInstance {
    private fallback?: string;

    public async set(value: string) {
        this.fallback = value;

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            return;
        }
    }

    public async get() {
        try {
            return await navigator.clipboard.readText();
        } catch {
            return this.fallback;
        }
    }
}

type OnCopy = (event: ClipboardCopyEvent) => void | boolean;
type OnPaste = (event: ClipboardPasteEvent) => void | boolean;

interface ClipboardContextType {
    onCopy: OnCopy[];
    onPaste: OnPaste[];
    clipboard: ClipboardInstance;
}

const DEFAULT_VALUE: ClipboardContextType = {
    onCopy: [],
    onPaste: [],
    clipboard: new ClipboardInstance(),
};

const ClipboardContext = React.createContext<ClipboardContextType>(DEFAULT_VALUE);

const ContextConnector = React.memo(() => {
    const context = React.useContext(ClipboardContext);

    useDocumentEvent('paste', async event => {
        if (isInputOrTextArea(event.target)) {
            return;
        }

        if (!event.clipboardData) {
            return;
        }

        const text = event.clipboardData.getData('text');

        if (Types.isString(text) && text.length > 0) {
            emitPaste(context, { type: 'Text', text });
            return;
        }

        const images: LoadedImage[] = [];

        for (let i = 0; i < event.clipboardData.files.length; i++) {
            const image = await loadImage(event.clipboardData.files.item(i));

            if (image != null) {
                images.push(image);
            }
        }

        if (images.length > 0) {
            emitPaste(context, { type: 'Image', images });
        }
    });

    useDocumentEvent('copy', event => {
        if (isInputOrTextArea(event.target)) {
            return;
        }
        
        for (const callback of context.onCopy) {
            if (callback({ isCut: false, clipboard: context.clipboard })) {
                break;
            }
        }
    });

    useDocumentEvent('cut', event => {
        if (isInputOrTextArea(event.target)) {
            return;
        }

        for (const callback of context.onCopy) {
            if (callback({ isCut: true, clipboard: context.clipboard })) {
                break;
            }
        }
    });

    return null;
});

export const ClipboardContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClipboardContext.Provider value={DEFAULT_VALUE}>
            <ContextConnector />

            {children}
        </ClipboardContext.Provider>
    );
};

interface ClipboardProps {
    // The paste event.
    onPaste?: OnPaste;

    // The copy event.
    onCopy?: OnCopy;
}

export function useClipboard(props?: ClipboardProps) {
    const context = React.useContext(ClipboardContext);
    const currentPaste = React.useRef(props?.onPaste);
    const currentCopy = React.useRef(props?.onCopy);

    currentPaste.current = props?.onPaste;
    currentCopy.current = props?.onCopy;

    React.useEffect(() => {
        const doCopy = (event: any) => {
            return currentCopy.current?.(event);
        };

        const doPaste = (event: any) => {
            return currentPaste.current?.(event);
        };

        context.onCopy.push(doCopy);
        context.onPaste.push(doPaste);

        return () => {
            context.onCopy.splice(context.onCopy.indexOf(doCopy), 1);
            context.onPaste.splice(context.onPaste.indexOf(doPaste), 1);
        };
    }, [context]);
    
    return React.useMemo(() => ({
        paste: async () => {
            tryEmitPaste(context);
        },
        copy: () => {
            emitCopy(context, false);
        },
        cut: () => {
            emitCopy(context, true);
        },
    }), [context]);
}

async function tryEmitPaste(context: ClipboardContextType) {
    const text = await context.clipboard.get();

    if (text) {
        emitPaste(context, { type: 'Text', text });
    }
}

function emitCopy(context: ClipboardContextType, isCut: boolean) {
    const frozenEvent = Object.freeze({ isCut, clipboard: context.clipboard });

    for (const callback of context.onCopy) {
        const shouldStop = callback(frozenEvent);

        if (shouldStop) {
            break;
        }
    }
}

function emitPaste(context: ClipboardContextType, event: ClipboardPasteEvent) {
    const frozenEvent = Object.freeze(event);

    for (const callback of context.onPaste) {
        const shouldStop = callback(frozenEvent);

        if (shouldStop) {
            break;
        }
    }
}

type LoadedImage = { width: number; height: number; source: string };

export function loadImage(file: File | null) {
    return new Promise<LoadedImage | null>((resolve) => {
        if (file === null || file.type.indexOf('image') < 0) {
            resolve(null);
            return;
        }

        const reader = new FileReader();

        reader.onload = (loadedFile: any) => {
            const imageSource: string = loadedFile.target.result;
            const imageElement = document.createElement('img');
    
            imageElement.onerror = () => {
                resolve(null);
            };
    
            imageElement.onload = () => {
                resolve({ source: imageSource, width: imageElement.width, height: imageElement.height });
            };

            imageElement.src = imageSource;
        };

        reader.onabort = () => {
            resolve(null);
        };

        reader.onerror = () => {
            resolve(null);
        };

        reader.readAsDataURL(file);
    });
}

function isInputOrTextArea(element: any) {
    const typed = element as HTMLElement;

    return typed && (typed.nodeName === 'INPUT' || typed.nodeName === 'TEXTAREA');
}