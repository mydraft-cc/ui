/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { RendererService } from '@app/wireframes/model/renderer.service';
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
import { Tabs } from './neutral/tabs';
import { TextArea } from './neutral/text-area';
import { TextInput } from './neutral/text-input';
import { Toggle } from './neutral/toggle';
import { VerticalLine } from './neutral/vertical-line';

import { Icon } from './shared/icon';
import { Raster } from './shared/raster';
import { AbstractControl } from './utils/abstract-control';

export function registerRenderers(): RendererService {
    return new RendererService()
        .addRenderer(new AbstractControl(new Browser()))
        .addRenderer(new AbstractControl(new Button()))
        .addRenderer(new AbstractControl(new ButtonBar()))
        .addRenderer(new AbstractControl(new Checkbox()))
        .addRenderer(new AbstractControl(new ComboBox()))
        .addRenderer(new AbstractControl(new Comment()))
        .addRenderer(new AbstractControl(new Dropdown()))
        .addRenderer(new AbstractControl(new Label()))
        .addRenderer(new AbstractControl(new Icon()))
        .addRenderer(new AbstractControl(new Image()))
        .addRenderer(new AbstractControl(new Heading()))
        .addRenderer(new AbstractControl(new HorizontalLine()))
        .addRenderer(new AbstractControl(new Link()))
        .addRenderer(new AbstractControl(new Numeric()))
        .addRenderer(new AbstractControl(new Paragraph()))
        .addRenderer(new AbstractControl(new Phone()))
        .addRenderer(new AbstractControl(new Progress()))
        .addRenderer(new AbstractControl(new RadioButton()))
        .addRenderer(new AbstractControl(new Raster()))
        .addRenderer(new AbstractControl(new Rectangle()))
        .addRenderer(new AbstractControl(new Shape()))
        .addRenderer(new AbstractControl(new Slider()))
        .addRenderer(new AbstractControl(new TextArea()))
        .addRenderer(new AbstractControl(new TextInput()))
        .addRenderer(new AbstractControl(new Tablet()))
        .addRenderer(new AbstractControl(new Tabs()))
        .addRenderer(new AbstractControl(new Toggle()))
        .addRenderer(new AbstractControl(new VerticalLine()));
}
