/**
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ShapePlugin, Vec2 } from '@app/wireframes/interface';
import { DiagramItem } from './../model';

export type NextListener<T> = (event: T) => void;

export class EngineMouseEvent {
    constructor(
        public readonly source: MouseEvent,
        public readonly position: Vec2,
    ) {
    }
}

export class EngineHitEvent extends EngineMouseEvent {
    constructor(source: MouseEvent, position: Vec2,
        public readonly object: EngineObject | null,
        public readonly item?: DiagramItem | null,
        public readonly target?: any,
    ) {
        super(source, position);
    }
}

export interface Engine {
    // Add a new layer to the render output with the name of the layer for debugging.
    layer(id?: string): EngineLayer;

    // Sets the layer that is used for click events.     
    setClickLayer(layer: EngineLayer): void;

    // Subscribe to all events.
    subscribe(listener: Listener): void;

    // Unsubscribe from all events.
    unsubscribe(listener: Listener): void;
}

export interface Listener {
    onBlur?(event: FocusEvent, next: NextListener<FocusEvent>): void;
    onDoubleClick?(event: EngineHitEvent, next: NextListener<EngineHitEvent>): void;
    onClick?(event: EngineHitEvent, next: NextListener<EngineHitEvent>): boolean;
    onMouseDown?(event: EngineHitEvent, next: NextListener<EngineHitEvent>): void;
    onMouseDrag?(event: EngineMouseEvent, next: NextListener<EngineMouseEvent>): void;
    onMouseMove?(event: EngineMouseEvent, next: NextListener<EngineMouseEvent>): void;
    onMouseUp?(event: EngineMouseEvent, next: NextListener<EngineMouseEvent>): void;
    onKeyDown?(event: KeyboardEvent, next: (event: KeyboardEvent) => void): void;
    onKeyUp?(event: KeyboardEvent, next: (event: KeyboardEvent) => void): void;
}

export interface EngineLayer {
    // Creates a new object to render a rect.
    rect(): EngineRect;

    // Creates a new object to render a ellipse.
    ellipse(): EngineRect;

    // Creates a new object to render a line.
    line(): EngineLine;

    // Creates a new object to render a text element.
    text(): EngineText;

    // Creates a new object to render an item.
    item(plugin: ShapePlugin): EngineItem;

    // Removes the layer from the parent.
    remove(): void;

    // Shows the layer.
    show(): void;

    // Hides the layer.
    hide(): void;

    // Makes a hit and returns matching elements.
    hitTest(x: number, y: number): EngineObject[];
}

export type EngineRectOrEllipsePlotArgs = { x: number; y: number; w: number; h: number; rotation?: number; rx?: number; ry?: number };

export interface EngineRectOrEllipse extends EngineObject {
    // Set the stroke width of the object.
    strokeWidth(value: number): void;

    // Set the stroke color of the object.
    strokeColor(value: string): void;

    // Sets the fill color.
    fill(value: string): void;

    // Renders with position, size and rotation.
    plot(args: EngineRectOrEllipsePlotArgs): void;
}

export interface EngineRect extends EngineRectOrEllipse {
}

export interface EngineEllipse extends EngineRectOrEllipse {
}

export type EngineLinePlotArgs = { x1: number; y1: number; x2: number; y2: number; width: number };

export interface EngineLine extends EngineObject {
    // The color of the line.
    color(value: string): void;

    // Renders the line from (x1, y1) to (x2, y2).
    plot(args: EngineLinePlotArgs): void;
}

export type EngineTextPlotArgs = { x: number; y: number; w: number; h: number; padding: number };

export interface EngineText extends EngineObject {
    // Sets the text color.
    color(value: string): void;

    // Sets the background color.
    fill(value: string): void;

    // Sets the font size.
    fontSize(value: number): void;

    // Sets the font family.
    fontFamily(value: string): void;

    // Sets the text content.
    text(value: string): void;

    // Defines the dimensions.
    plot(args: { x: number; y: number; w: number; h: number; padding: number }): void;
}

export interface EngineObject {
    // Defines the cursor for the object.
    cursor(value: string | number): void;

    // Removes the element from the parent.
    remove(): void;

    // Shows the object.
    show(): void;

    // Hides the object.
    hide(): void;

    // Disable the object.
    disable(): void;
}

export interface EngineItem extends EngineObject {
    // Removes the element from the parent.
    detach(): void;

    // Renders the item.
    plot(item: DiagramItem | null): void;
}