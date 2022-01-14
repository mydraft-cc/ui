/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { DiagramItem } from '@app/wireframes/model';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';

export interface NavigateAdornerProps {
    // The interaction service.
    interactionService: InteractionService;

    // A function that is invoked when the user clicked a link.
    onNavigate: (item: DiagramItem, link: string) => void;
}

export class NavigateAdorner extends React.PureComponent<NavigateAdornerProps> implements InteractionHandler {
    public componentDidMount() {
        this.props.interactionService.addHandler(this);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);
    }

    public onClick(event: SvgEvent, next: (event: SvgEvent) => void) {
        if (event.shape) {
            const link = event.shape.link;

            if (link) {
                this.props.onNavigate(event.shape, link);
            }
        }

        next(event);

        return false;
    }

    public render() {
        return null;
    }
}
