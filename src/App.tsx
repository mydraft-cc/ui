import * as React from 'react';

import { RendererService } from '@app/wireframes/model';

import { EditorViewContainer } from '@app/wireframes/renderer/editor';

interface AppProps {
    // The renderer service.
    rendererService: RendererService;
}

export class App extends React.Component<AppProps, {}> {
    public render() {
        return (
            <div>
                <EditorViewContainer rendererService={this.props.rendererService} />
            </div>
        );
    }
}
