/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Keys, sizeInPx } from '@app/core';
import { Engine, EngineHitEvent, Listener } from '@app/wireframes/engine';
import { DefaultAppearance } from '@app/wireframes/interface';
import { Diagram, DiagramItem, DiagramItemSet } from '@app/wireframes/model';
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

    // The engine.
    engine: Engine;

    // A helper function to show adorners.
    showAdorners: () => void;

    // A helper function to hideAdorners adorners.
    hideAdorners: () => void;

    // A function to change the appearance of a visual.
    onChangeItemsAppearance: (diagram: Diagram, visuals: DiagramItem[], key: string, val: any) => any;
}

export class TextAdorner extends React.PureComponent<TextAdornerProps> implements Listener {
    private readonly style = { display: 'none ' };
    private selectedShape: DiagramItem | null = null;
    private textareaElement: HTMLTextAreaElement = null!;

    public componentDidMount() {
        window.addEventListener('mousedown', this.handleMouseDown);
    }

    public componentDidUpdate(prevProps: TextAdornerProps) {
        if (this.props.engine !== prevProps.engine) {
            if (prevProps.engine) {
                prevProps.engine.unsubscribe(this);
            }
    
            if (this.props.engine) {
                this.props.engine.subscribe(this);
            }
        }

        if (this.props.selectionSet !== prevProps.selectionSet) {
            this.updateText();
        }
    }

    public componentWillUnmount() {
        if (this.props.engine) {
            this.props.engine.unsubscribe(this);
        }

        window.removeEventListener('mousedown', this.handleMouseDown);
    }

    private handleMouseDown = (e: MouseEvent) => {
        if (e.target !== this.textareaElement) {
            this.hide();
        }
    };

    public onDoubleClick(event: EngineHitEvent) {
        if (event.item && !event.item.isLocked && this.textareaElement) {
            if (event.item.textDisabled) {
                return;
            }

            const zoom = this.props.zoom;

            const transform = event.item.transform;

            const x = sizeInPx(zoom * (transform.position.x - 0.5 * transform.size.x) - 2);
            const y = sizeInPx(zoom * (transform.position.y - 0.5 * transform.size.y) - 2);

            const w = sizeInPx(zoom * (Math.max(transform.size.x, MIN_WIDTH)) + 4);
            const h = sizeInPx(zoom * (Math.max(transform.size.y, MIN_HEIGHT)) + 4);

            this.textareaElement.value = event.item.text;
            this.textareaElement.style.top = y;
            this.textareaElement.style.left = x;
            this.textareaElement.style.width = w;
            this.textareaElement.style.height = h;
            this.textareaElement.style.resize = 'none';
            this.textareaElement.style.display = 'block';
            this.textareaElement.style.position = 'absolute';
            this.textareaElement.focus();

            this.props.hideAdorners();
            this.selectedShape = event.item;
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

        const textNew = this.textareaElement.value;
        const textOld = this.selectedShape.text;

        if (textNew !== textOld) {
            this.props.onChangeItemsAppearance(this.props.selectedDiagram, [this.selectedShape], DefaultAppearance.TEXT, textNew);
        }

        this.hide();
    }

    private hide() {
        this.selectedShape = null;

        this.textareaElement.style.width = '0';
        this.textareaElement.style.display = 'none';

        this.props.showAdorners();
    }

    public render() {
        return (
            <textarea className='ant-input ant-input-outlined ant-input-css-var no-border-radius text-adorner-textarea'
                ref={this.doInitialize}
                onBlur={this.doHide}
                onKeyDown={this.doSubmit}
                style={this.style} />
        );
    }
}
