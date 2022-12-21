/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { RendererService } from '@app/wireframes/model/renderer.service';
import { Browser, Button, ButtonBar, Checkbox, ComboBox, Comment, Dropdown, Grid, Heading, HorizontalLine, HorizontalScrollbar, Icon, Image, Label, Link, List, Numeric, Paragraph, Phone, Progress, RadioButton, Raster, Rectangle, Shape, Slider, Tablet, Tabs, TextArea, TextInput, Toggle, VerticalLine, VerticalScrollbar, Window } from './dependencies';
import { AbstractControl } from './utils/abstract-control';

export function registerRenderers() {
    RendererService.addRenderer(new AbstractControl(new Browser()));
    RendererService.addRenderer(new AbstractControl(new Button()));
    RendererService.addRenderer(new AbstractControl(new ButtonBar()));
    RendererService.addRenderer(new AbstractControl(new Checkbox()));
    RendererService.addRenderer(new AbstractControl(new ComboBox()));
    RendererService.addRenderer(new AbstractControl(new Dropdown()));
    RendererService.addRenderer(new AbstractControl(new Grid()));
    RendererService.addRenderer(new AbstractControl(new Heading()));
    RendererService.addRenderer(new AbstractControl(new HorizontalLine()));
    RendererService.addRenderer(new AbstractControl(new HorizontalScrollbar()));
    RendererService.addRenderer(new AbstractControl(new Icon()));
    RendererService.addRenderer(new AbstractControl(new Image()));
    RendererService.addRenderer(new AbstractControl(new Label()));
    RendererService.addRenderer(new AbstractControl(new Link()));
    RendererService.addRenderer(new AbstractControl(new List()));
    RendererService.addRenderer(new AbstractControl(new Numeric()));
    RendererService.addRenderer(new AbstractControl(new Paragraph()));
    RendererService.addRenderer(new AbstractControl(new Phone()));
    RendererService.addRenderer(new AbstractControl(new Progress()));
    RendererService.addRenderer(new AbstractControl(new RadioButton()));
    RendererService.addRenderer(new AbstractControl(new Raster()));
    RendererService.addRenderer(new AbstractControl(new Rectangle()));
    RendererService.addRenderer(new AbstractControl(new Shape()));
    RendererService.addRenderer(new AbstractControl(new Slider()));
    RendererService.addRenderer(new AbstractControl(new Tablet()));
    RendererService.addRenderer(new AbstractControl(new Tabs()));
    RendererService.addRenderer(new AbstractControl(new TextArea()));
    RendererService.addRenderer(new AbstractControl(new TextInput()));
    RendererService.addRenderer(new AbstractControl(new Toggle()));
    RendererService.addRenderer(new AbstractControl(new VerticalLine()));
    RendererService.addRenderer(new AbstractControl(new VerticalScrollbar()));
    RendererService.addRenderer(new AbstractControl(new Window()));
    RendererService.addRenderer(new AbstractControl(new Comment()));
}
