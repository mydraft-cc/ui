import * as React from 'react';
import { Input } from 'antd';

import './shapes.scss';

import {
    RendererService
} from '@app/wireframes/model';

interface ShapeInfo {
    renderer: string;
    nameKey: string;
    name: string;
}

interface ShapesProps {
    // The renderer.
    rendererService: RendererService;
}

interface ShapesState {
    // All visuals.
    visuals: ShapeInfo[];

    // The filtered visuals.
    filteredShapes: ShapeInfo[];

    // The filter string.
    filter: string;
}

export class Shapes extends React.Component<ShapesProps, ShapesState> {
    constructor(props: ShapesProps) {
        super(props);

        const allShapes: ShapeInfo[] = [];

        for (let rendererKey in props.rendererService.registeredRenderers) {
            if (props.rendererService.registeredRenderers.hasOwnProperty(rendererKey)) {
                const renderer = props.rendererService.registeredRenderers[rendererKey];

                if (renderer.showInGallery()) {
                    allShapes.push({
                        nameKey: rendererKey.toLowerCase(),
                        name: rendererKey,
                        renderer: rendererKey
                    });
                }
            }
        }

        this.state = { visuals: allShapes, filteredShapes: allShapes, filter: '' };
    }

    public render() {
        const pathToShapes = require.context('../../images/shapes', true);

        const urlPath = (name: string) => {
            return pathToShapes(`./${name.toLowerCase()}.png`);
        };

        return (
            <>
                <div className='shapes-search'>
                    <Input />
                </div>

                <div className='shapes-list'>
                    {this.state.filteredShapes.map(v =>
                        <div key={v.name} className='shape'>
                            <div className='shape-image-row'>
                                <img className='shape-image' alt={v.name} src={urlPath(v.nameKey)} />
                            </div>

                            <div className='shape-title'>{v.name}}</div>
                        </div>
                    )}
                </div>
            </>
        );
    }
}