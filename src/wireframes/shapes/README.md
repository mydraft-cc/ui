# How to write a custom shape?

Writing custom shapes is relatively easy and can be best understood by having a look to an existing implementation.

## Terms

Before we start we need to clarify a few terms:

* **Appearance**: A list of properties, like colors and texts that define the appearance of a shape.
* **Identifier**: A unique name for the shape type.
* **Configurables**: A definition how custom appearance values should be displayed and edited in the right sidebar.
* **Constraints**: Restrict the size calculation of the shape, e.g. the height of the label depends on the font size.
* **Default Size**: The initial size when the shape is added to a diagram.

## Steps

When you create a new shape you have to execute the following steps:

1. Create a new shape class.
2. Create a copy of a shape image and rename it to the `{{identifier}}.png`.
3. Add the shape class to the [index.ts](index.ts) file.
4. Add the shape to a diagram and make a screenshot.
5. Replace the image `{{identifier}}.png` with your screenshot.

## Example

The following example is a toggle button. The main responsibility of the shape is to render the SVG statements using an imperative approach. The render method is called whenever a change is changed. Then a diff process makes the necessary changes to update the SVG elements, to destroy them or to add new elements.

```
const STATE = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';

const DEFAULT_APPEARANCE = {};
[DefaultAppearance.FOREGROUND_COLOR]: 0x238b45,
[DefaultAppearance.BACKGROUND_COLOR]: 0xbdbdbd,
[DefaultAppearance.TEXT_DISABLED]: true,
[DefaultAppearance.STROKE_COLOR]: 0xffffff,
[DefaultAppearance.STROKE_THICKNESS]: 4,
[STATE]: STATE_CHECKED,

export class Toggle implements ShapePlugin {
    public identifier(): string {
        return 'Toggle';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 60, y: 30 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.selection(STATE, 'State', [
                STATE_NORMAL,
                STATE_CHECKED,
            ]),
        ];
    }

    public render(ctx: RenderContext) {
        const border = ctx.shape.strokeThickness;

        const radius = Math.min(ctx.rect.width, ctx.rect.height) * 0.5;

        const isUnchecked = ctx.shape.getAppearance(STATE) === STATE_NORMAL;

        const circleY = ctx.rect.height * 0.5;
        const circleX = isUnchecked ? radius : ctx.rect.width - radius;

        const circleCenter = new Vec2(circleX, circleY);
        const circleSize = radius - border;

        const barColor = isUnchecked ? ctx.shape : ctx.shape.foregroundColor;

        // Pill
        ctx.renderer2.rectangle(0, radius, ctx.rect, p => {
            p.setBackgroundColor(barColor);
        });

        // Circle.
        ctx.renderer2.ellipse(0, Rect2.fromCenter(circleCenter, circleSize), p => {
            p.setBackgroundColor(ctx.shape.strokeColor);
        });
    }
}
```