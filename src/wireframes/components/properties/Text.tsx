/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Input } from 'antd';
import * as React from 'react';

export interface TextProps {
    disabled?: boolean;

    // The current text.
    text?: string;

    // Set the text.
    onTextChange: (text: string) => void;
}

export const Text = (props: TextProps) => {
    const { disabled, onTextChange, text } = props;

    const currentText = React.useRef(text);
    const [value, setValue] = React.useState(text);

    React.useEffect(() => {
        currentText.current = text;

        setValue(text);
    }, [text]);

    const doSetText = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        currentText.current = event.target.value;

        setValue(event.target.value);
    }, []);

    const doApply = React.useCallback(() => {
        onTextChange(currentText.current);
    }, [onTextChange]);

    return (
        <Input disabled={disabled} value={value} onChange={doSetText} onBlur={doApply} />
    );
};
