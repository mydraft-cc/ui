/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Engine, EngineHitEvent, Listener } from '@app/wireframes/engine';
import { DiagramItem } from '@app/wireframes/model';

export interface NavigateAdornerProps {
    // The interaction service.
    engine: Engine;

    // A function that is invoked when the user clicked a link.
    onNavigate: (item: DiagramItem, link: string) => void;
}

export class NavigateAdorner extends React.PureComponent<NavigateAdornerProps> implements Listener {
    public componentDidUpdate(prevProps: NavigateAdornerProps) {
        if (this.props.engine !== prevProps.engine) {
            if (prevProps.engine) {
                prevProps.engine.unsubscribe(this);
            }
    
            if (this.props.engine) {
                this.props.engine.subscribe(this);
            }
        }
    }

    public componentWillUnmount() {
        if (this.props.engine) {
            this.props.engine.unsubscribe(this);
        }
    }

    public onClick(event: EngineHitEvent, next: (event: EngineHitEvent) => void) {
        const target = getShapeWithLink(event);

        if (target) {
            this.props.onNavigate(target.shape, target.link);
        }

        next(event);
        return false;
    }

    public onMouseMove(event: EngineHitEvent, next: (event: EngineHitEvent) => void) {
        if (getShapeWithLink(event)) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'inherit';
        }

        next(event);
    }

    public render() {
        return null;
    }
}

function getShapeWithLink(event: EngineHitEvent) {
    const link = event.item?.link;

    if (link) {
        return { shape: event.item, link };
    } else {
        return null;
    }
}
