/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Keys, sizeInPx } from '@app/core';
import { DefaultAppearance } from '@app/wireframes/interface';
import { Diagram, DiagramItem, DiagramItemSet } from '@app/wireframes/model';
import { InteractionHandler, InteractionService, SvgEvent } from './interaction-service';
import './TextAdorner.scss';

const MIN_WIDTH = 150;
const MIN_HEIGHT = 30;

export interface TextAdornerProps {
    // The current zoom value.
    zoom: number;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectionSet: DiagramItemSet;

    // The interaction service.
    interactionService: InteractionService;

    // A function to change the appearance of a visual.
    onChangeItemsAppearance: (diagram: Diagram, visuals: DiagramItem[], key: string, val: any) => any;
}

export class TextAdorner extends React.PureComponent<TextAdornerProps> implements InteractionHandler {
    private readonly style = { display: 'none ' };
    private selectedShape: DiagramItem | null = null;
    private textareaElement: HTMLTextAreaElement = null!;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

        window.addEventListener('mousedown', this.handleMouseDown);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);

        window.removeEventListener('mousedown', this.handleMouseDown);
    }

    public componentDidUpdate(prevProps: TextAdornerProps) {
        if (this.props.selectionSet !== prevProps.selectionSet) {
            this.updateText();
        }
    }

    private handleMouseDown = (e: MouseEvent) => {
        if (e.target !== this.textareaElement) {
            this.hide();
        }
    };

    public onDoubleClick(event: SvgEvent) {
        if (event.shape && !event.shape.isLocked && this.textareaElement) {
            if (event.shape.textDisabled) {
                return;
            }

            const zoom = this.props.zoom;

            const transform = event.shape.transform;

            const x = sizeInPx(zoom * (transform.position.x - 0.5 * transform.size.x) - 2);
            const y = sizeInPx(zoom * (transform.position.y - 0.5 * transform.size.y) - 2);

            const w = sizeInPx(zoom * (Math.max(transform.size.x, MIN_WIDTH)) + 4);
            const h = sizeInPx(zoom * (Math.max(transform.size.y, MIN_HEIGHT)) + 4);

            this.textareaElement.value = event.shape.text;
            this.textareaElement.style.top = y;
            this.textareaElement.style.left = x;
            this.textareaElement.style.width = w;
            this.textareaElement.style.height = h;
            this.textareaElement.style.resize = 'none';
            this.textareaElement.style.display = 'block';
            this.textareaElement.style.position = 'absolute';
            this.textareaElement.focus();

            this.props.interactionService.hideAdorners();

            this.selectedShape = event.shape;
        }
    }

    private doInitialize = (textarea: HTMLTextAreaElement) => {
        this.textareaElement = textarea;
    };

    private doHide = () => {
        this.hide();
    };

    private doSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((Keys.isEnter(event) && !event.shiftKey) || Keys.isEscape(event)) {
            if (Keys.isEnter(event)) {
                this.updateText();
            } else {
                this.hide();
            }

            this.hide();

            event.preventDefault();
            event.stopPropagation();
        }
    };

    private updateText() {
        if (!this.selectedShape) {
            return;
        }

        const newText = this.textareaElement.value;
        const oldText = this.selectedShape.text;

        if (newText !== oldText) {
            this.props.onChangeItemsAppearance(this.props.selectedDiagram, [this.selectedShape], DefaultAppearance.TEXT, newText);
        }

        this.hide();
    }

    private hide() {
        this.selectedShape = null;

        this.textareaElement.style.width = '0';
        this.textareaElement.style.display = 'none';

        this.props.interactionService.showAdorners();
    }

    public render() {
        return (
            <textarea className='ant-input ant-input-outlined ant-input-css-var no-border-radius text-adorner-textarea'
                style={this.style}
                ref={this.doInitialize}
                onBlur={this.doHide}
                onKeyDown={this.doSubmit} />
        );
    }
}
