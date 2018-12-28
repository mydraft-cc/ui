import { Browser } from './neutral/browser';
import { Button } from './neutral/button';
import { ButtonBar } from './neutral/button-bar';
import { Checkbox } from './neutral/checkbox';
import { ComboBox } from './neutral/combo-box';
import { Comment } from './neutral/comment';
import { Dropdown } from './neutral/dropdown';
import { Heading } from './neutral/heading';
import { HorizontalLine } from './neutral/horizontal-line';
import { Image } from './neutral/image';
import { Label } from './neutral/label';
import { Link } from './neutral/link';
import { Numeric } from './neutral/numeric';
import { Paragraph } from './neutral/paragraph';
import { Phone } from './neutral/phone';
import { Progress } from './neutral/progress';
import { RadioButton } from './neutral/radio-button';
import { Rectangle } from './neutral/rectangle';
import { Shape } from './neutral/shape';
import { Slider } from './neutral/slider';
import { Tablet } from './neutral/tablet';
import { TextArea } from './neutral/text-area';
import { TextInput } from './neutral/text-input';
import { Toggle } from './neutral/toggle';
import { VerticalLine } from './neutral/vertical-line';

import { Icon } from './shared/icon';
import { Raster } from './shared/raster';

import { RendererService } from '@app/wireframes/model/renderer.service';

export function registerRenderers(): RendererService {
    return new RendererService()
        .addRenderer(new Browser())
        .addRenderer(new Button())
        .addRenderer(new ButtonBar())
        .addRenderer(new Checkbox())
        .addRenderer(new ComboBox())
        .addRenderer(new Comment())
        .addRenderer(new Dropdown())
        .addRenderer(new Label())
        .addRenderer(new Icon())
        .addRenderer(new Image())
        .addRenderer(new Heading())
        .addRenderer(new HorizontalLine())
        .addRenderer(new Link())
        .addRenderer(new Numeric())
        .addRenderer(new Paragraph())
        .addRenderer(new Phone())
        .addRenderer(new Progress())
        .addRenderer(new RadioButton())
        .addRenderer(new Raster())
        .addRenderer(new Rectangle())
        .addRenderer(new Shape())
        .addRenderer(new Slider())
        .addRenderer(new TextArea())
        .addRenderer(new TextInput())
        .addRenderer(new Tablet())
        .addRenderer(new Toggle())
        .addRenderer(new VerticalLine());
}