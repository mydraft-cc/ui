import * as React from 'react';
import * as paper from 'paper';

import {
    Diagram,
    DiagramVisual,
    DiagramItem,
    DiagramShape
} from '@app/wireframes/model';

import {
    InteractionHandler,
    InteractionService
} from './interaction-service';

const MIN_WIDTH = 150;
const MIN_HEIGHT = 30;

const KEY_ENTER = 13;
const KEY_ESCAPE = 27;

export interface TextAdornerProps {
    // The current zoom value.
    zoom: number;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction service.
    interactionService: InteractionService;

    // A function to change the appearance of a visual.
    changeItemsAppearance: (diagram: Diagram, visuals: DiagramVisual[], key: string, val: any) => void;

    // A function to retrieve a render element by diagram item.
    provideItemByElement: (item: paper.Item) => DiagramItem | null;
}

export class TextAdorner extends React.Component<TextAdornerProps> implements InteractionHandler {
    private selectedShape: DiagramShape | null = null;
    private textareaElement: HTMLTextAreaElement;

    public componentDidMount() {
        this.props.interactionService.addHandler(this);

        window.addEventListener('mousedown', this.handleMouseDown);
    }

    public componentWillUnmount() {
        this.props.interactionService.removeHandler(this);

        window.removeEventListener('mousedown', this.handleMouseDown);
    }

    public componentWillReceiveProps(nextProps: TextAdornerProps) {
        if (this.props.selectedItems !== nextProps.selectedItems) {
            this.updateText();
        }
    }

    private handleMouseDown = (e: MouseEvent) => {
        if (e.target !== this.textareaElement) {
            this.hide();
        }
    }

    public onDoubleClick(event: paper.ToolEvent) {
        if (event.item && this.textareaElement) {
            const selectedItem = this.props.provideItemByElement(event.item);

            if (selectedItem && selectedItem instanceof DiagramShape) {
                if (selectedItem.appearance.get(DiagramShape.APPEARANCE_TEXT_DISABLED) === true) {
                    return;
                }

                const zoom = this.props.zoom;

                const transform = selectedItem.transform;

                const x = zoom * (transform.position.x - 0.5 * transform.size.x) + 'px';
                const y = zoom * (transform.position.y - 0.5 * transform.size.y) + 'px';

                const w = zoom * (Math.max(transform.size.x, MIN_WIDTH) + 1) + 'px';
                const h = zoom * (Math.max(transform.size.y, MIN_HEIGHT) + 1) + 'px';

                this.textareaElement.value = selectedItem.appearance.get(DiagramShape.APPEARANCE_TEXT) || '';
                this.textareaElement.style.top = y;
                this.textareaElement.style.left = x;
                this.textareaElement.style.width = w;
                this.textareaElement.style.height = h;
                this.textareaElement.style.resize = 'none';
                this.textareaElement.style.display = 'block';
                this.textareaElement.style.position = 'absolute';
                this.textareaElement.focus();

                this.selectedShape = selectedItem;

                this.props.interactionService.showAdornerLayers(false);
            }
        }
    }

    private onTextareaBlur = () => {
        this.hide();
    }

    private onTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.keyCode === KEY_ENTER && !this.props.interactionService.isShiftKeyPressed()) ||
            (event.keyCode === KEY_ESCAPE)) {

            if (event.keyCode === KEY_ENTER) {
                this.updateText();
            } else {
                this.hide();
            }

            this.hide();

            event.preventDefault();
            event.stopPropagation();
        }
    }

    private updateText() {
        if (!this.selectedShape) {
            return;
        }

        const newText = this.textareaElement.value;
        const oldText = this.selectedShape.appearance.get(DiagramShape.APPEARANCE_TEXT);

        if (newText !== oldText) {
            this.props.changeItemsAppearance(this.props.selectedDiagram, [this.selectedShape], DiagramShape.APPEARANCE_TEXT, newText);
        }

        this.hide();
    }

    private hide() {
        this.selectedShape = null;

        this.textareaElement.style.width = '0';
        this.textareaElement.style.display = 'none';

        this.props.interactionService.showAdornerLayers(true);
    }

    public render() {
        return (
            <div style={{position: 'relative'}}>
                <textarea className='ant-input' style={{ display: 'none '}} ref={(element) => { this.textareaElement = element!; }} onBlur={this.onTextareaBlur} onKeyDown={this.onTextareaKeyDown} />
            </div>
        );
    }
}