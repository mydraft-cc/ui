import * as React from 'react';

export interface TitleProps {
    text: string;
}

export const Title = (props: TitleProps) => {
    React.useEffect(() => {
        document.title = props.text;
    });

    return (<></>);
};