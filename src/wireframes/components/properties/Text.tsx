/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Input } from 'antd';
import * as React from 'react';
import { useEventCallback } from '@app/core';

export interface TextProps {
    disabled?: boolean;

    // The current text.
    text?: string;

    // Set the text.
    onTextChange: (text: string | undefined) => void;
}

export const Text = (props: TextProps) => {
    const { disabled, onTextChange, text } = props;

    const [value, setValue] = React.useState(text);

    React.useEffect(() => {
        setValue(text);
    }, [text]);

    const doSetText = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    });

    const doApply = useEventCallback(() => {
        onTextChange(value);
    });

    return (
        <Input disabled={disabled} value={value} onChange={doSetText} onBlur={doApply} />
    );
};
