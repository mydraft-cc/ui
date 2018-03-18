# How to create a shape?

We use the radio button as an example for a custom shape, please read the comments carefully to understand the shape definition.

```typescript
import { AbstractControl, AbstractContext } from './utils/abstract-control';

const STATE_KEY = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';
const CIRCLE_MARGIN = 4;
const CIRCLE_RADIUS = 9;
const CIRCLE_POSITION_X = CIRCLE_MARGIN + CIRCLE_RADIUS;
const CIRCLE_CHECK_RADIUS = CIRCLE_RADIUS - 4;
const TEXT_POSITION_X = 2 * CIRCLE_MARGIN + 2 * CIRCLE_RADIUS;

import { Rect2, Vec2 } from '@app/core';

import {
    Configurable,
    DiagramShape,
    SelectionConfigurable,
    TextHeightConstraint
} from '@app/wireframes/model';

import { AbstractControl, AbstractContext } from '@app/wireframes/shapes/utils/abstract-control';
// Import our theme with shared colors and stylings. 
// If you create a shape for material design or so, create your custom file
// and place your shapes in a custom folder.
import { CommonTheme } from './_theme';

// Define some constants. See later how we use them.
const STATE_KEY = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';
const CIRCLE_MARGIN = 4;
const CIRCLE_RADIUS = 9;
const CIRCLE_POSITION_X = CIRCLE_MARGIN + CIRCLE_RADIUS;
const CIRCLE_CHECK_RADIUS = CIRCLE_RADIUS - 4;
const TEXT_POSITION_X = 2 * CIRCLE_MARGIN + 2 * CIRCLE_RADIUS;

// Each shape has an appearance object, that defines how the shape is renderer.
// We can use default values from the AbstractControl, so that all our shapes get the same border color.
const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'RadioButton';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[STATE_KEY] = STATE_NORMAL;

// Configurable can be used to make custom properties editable, e.g. we define
// thate the state appearance can be changed with a select box.
// The following configurable exists:
// 1. ColorConfigurable: Color picker  for colors
// 2. NumberConfigurable (Min=0, Max=100): Number Input for numbers. 
// 3. SelectionConfigurable (AllowedValues=[]): Select box for strings.
// 4. SliderConfigurable (Min=0, Max=100): Slider for numbers. 
const CONFIGURABLES: Configurable[] = [
    new SelectionConfigurable(STATE_KEY, 'State',
        [
            STATE_NORMAL,
            STATE_CHECKED
        ])
];

// Define a a size constraint to calculate the size of the shape automatically. 
const CONSTRAINT = new TextHeightConstraint(8);

export class RadioButton extends AbstractControl {
    // Return an unique identifier for this shape.
    public identifier(): string {
        return 'RadioButton';
    }

    // Create a default shape with a default size (which does not respect the constraints yet).
    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 130, 36, CONFIGURABLES, DEFAULT_APPEARANCE, shapeId, CONSTRAINT);
    }

    // Render the shape.
    protected renderInternal(ctx: AbstractContext) {
        this.createCircle(ctx);
        this.createText(ctx);
    }

    private createCircle(ctx: AbstractContext) {
        // Use the boundds (= dimension) of the shape.
        const y = 0.5 * ctx.bounds.size.y;

        // Use the renderer to create new primitives, in this case a cicle.
        const circleItem = ctx.renderer.createCircle(new Vec2(CIRCLE_POSITION_X, y), ctx.shape, CIRCLE_RADIUS);

        // Use the renderer to style the primitives. You can either pass in concrete colors or the shape itself.
        // In the second case the renderer extracts the values from the appearance object of the shape.
        ctx.renderer.setStrokeColor(circleItem, ctx.shape);
        ctx.renderer.setBackgroundColor(circleItem, ctx.shape);

        // Add your shape to render it.
        ctx.add(circleItem);

        const state = ctx.shape.appearance.get(STATE_KEY);

        // Use the appearance for conditional rendering.
        if (state === STATE_CHECKED) {
            const checkCircleItem = ctx.renderer.createCircle(new Vec2(CIRCLE_POSITION_X, y), 0, CIRCLE_CHECK_RADIUS);

            ctx.renderer.setBackgroundColor(checkCircleItem, ctx.shape.appearance.get(DiagramShape.APPEARANCE_STROKE_COLOR));

            ctx.add(checkCircleItem);
        }
    }

    private createText(ctx: AbstractContext) {
        const w = ctx.shape.transform.size.x - TEXT_POSITION_X;
        const h = ctx.shape.transform.size.y;

        const textItem = ctx.renderer.createSinglelineText(new Rect2(new Vec2(TEXT_POSITION_X, 0), new Vec2(w, h)), ctx.shape);

        ctx.add(textItem);
    }
}
```

Also add your shape to the renderer service in `index.ts`:

````typescript
// ...
import { RadioButton }  from './neutral/radio-button';
// ...
// Please sort the imports alphabetically.

import { RendererService } from '@app/wireframes/model/renderer.service';

export function registerRenderers(): RendererService {
    return new RendererService()
        // ...
        .addRenderer(new RadioButton())
        // ...
        // Please sort it alphabetically;
}
````