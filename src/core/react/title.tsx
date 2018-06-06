import * as React from 'react';

export interface TitleProps {
    text: string;
}

export class Title extends React.PureComponent<TitleProps> {
    constructor(props: TitleProps) {
        super(props);

        document.title = props.text;
    }

    public componentWillReceiveProps(props: TitleProps) {
        document.title = props.text;
    }

    public render() {
        return null;
    }
}