/**
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Vec2 } from '@app/core';
import { ShapePlugin } from '@app/wireframes/interface';
import { DiagramItem } from './../model';

export type NextListener<T> = (event: T) => void;

export class HitEvent {
    constructor(
        public readonly event: MouseEvent,
        public readonly position: Vec2,
        public readonly layer: EngineLayer,
        public readonly object?: EngineObject | null,
        public readonly item?: DiagramItem | null,
    ) {
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

    // Calculates the dimensions of an object.
    getLocalBounds(object: Object): Rect2;
}

export interface Listener {
    onBlur?(event: FocusEvent, next: NextListener<FocusEvent>): void;
    onDoubleClick?(event: HitEvent, next: NextListener<HitEvent>): void;
    onClick?(event: HitEvent, next: NextListener<HitEvent>): boolean;
    onMouseDown?(event: HitEvent, next: NextListener<HitEvent>): void;
    onMouseDrag?(event: HitEvent, next: NextListener<HitEvent>): void;
    onMouseMove?(event: HitEvent, next: NextListener<HitEvent>): void;
    onMouseUp?(event: HitEvent, next: NextListener<HitEvent>): void;
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
}

export interface EngineRect extends EngineObject {
    // Set the stroke width of the object.
    strokeWidth(width: number): void;
    // Set the stroke color of the object.
    strokeColor(color: string): void;

    // Sets the fill color.
    fill(value: string): void;

    // Renders with position, size and rotation.
    plot(x: number, y: number, w: number, h: number, rotation?: number, rx?: number, ry?: number): void;
}

export interface EngineLine extends EngineObject {
    // The color of the line.
    color(value: string): void;

    // Renders the line from (x1, y1) to (x2, y2) if the object is a line.
    plot(x1: number, y1: number, x2: number, y2: number, width: number): void;
}

export interface EngineText extends EngineObject {
    // Sets the text color.
    color(value: string): void;

    // Sets the background color.
    fill(value: string): void;

    // Sets the font size.
    fontSize(value: string): void;

    // Sets the font family.

    fontFamily(value: string): void;

    // Sets the text content.
    text(value: string): void;

    // Defines the dimensions.
    plot(x: number, y: number, w: number, h: number, padding: number): void;
}

export interface EngineObject {
    // Defines the cursor for the object.
    cursor(value: string): void;
    
    // Defines the cursor angle.
    cursorAngle(value: number): void;

    // Removes the element from the parent.
    remove(): void;

    // Shows the object.
    show(): void;

    // Hides the object.
    hide(): void;

    // Disable the object.
    disable(): void;

    // Gets the tag by value.
    tag<T>(key: string): T;

    // Sets the tag by value.
    tag<T>(key: string, value: T): void;

    // Sets or gets the label.
    label(value?: string): string;
}

export interface EngineItem {
    // Removes the element from the parent.
    remove(): void;

    // Invalidates the item.
    invalidate(item: DiagramItem): void;
    
    // Checks if the item has the correct index.
    checkIndex(index: number): boolean;

    // Renders a temporary preview.
    preview(item: DiagramItem | null): void;
}