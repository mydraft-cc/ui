import * as React from 'react';

export const Title = React.memo(({ text }: { text: string }) => {
    React.useEffect(() => {
        document.title = text;
    }, [text]);

    return null;
});