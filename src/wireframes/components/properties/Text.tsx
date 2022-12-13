/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Input } from 'antd';
import * as React from 'react';
import { Keys, useEventCallback } from '@app/core';

export interface TextProps {
    disabled?: boolean;

    // The current text.
    text?: string;

    // The selection.
    selection?: any;

    // Set the text.
    onTextChange: (text: string | undefined) => void;
}

export const Text = (props: TextProps) => {
    const { disabled, onTextChange, selection, text } = props;

    const [value, setValue] = React.useState(text);
    const previousText = React.useRef(text);

    React.useEffect(() => {
        setValue(text);
        
        previousText.current = text;
    }, [selection, text]);

    const doSetText = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    });

    const doBlur = useEventCallback(() => {
        if (value !== previousText.current) {
            onTextChange(value);

            previousText.current = value;
        }
    });

    const doApply = useEventCallback((event: React.KeyboardEvent) => {
        if (value !== previousText.current && Keys.isEnter(event)) {
            onTextChange(value);

            previousText.current = value;
        }
    });

    return (
        <Input disabled={disabled} value={value} onChange={doSetText} onBlur={doBlur} onKeyDown={doApply} />
    );
};
