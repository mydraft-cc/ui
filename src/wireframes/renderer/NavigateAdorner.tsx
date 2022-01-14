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
        const target = getShapeWithLink(event);

        if (target) {
            this.props.onNavigate(target.shape, target.link);
        }

        next(event);

        return false;
    }

    public onMouseMove(event: SvgEvent, next: (event: SvgEvent) => void) {
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

function getShapeWithLink(event: SvgEvent) {
    const link = event.shape?.link;

    if (link) {
        return { shape: event.shape, link };
    } else {
        return null;
    }
}
