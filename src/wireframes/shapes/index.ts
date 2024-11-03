/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { PluginRegistry } from '@app/wireframes/model/registry';
import { Browser, Button, ButtonBar, Checkbox, ComboBox, Comment, Dropdown, Grid, Heading, HorizontalLine, HorizontalScrollbar, Icon, Image, Label, Link, List, Numeric, Paragraph, Phone, Progress, RadioButton, Raster, Rectangle, Shape, Slider, Tablet, Tabs, TextArea, TextInput, Toggle, VerticalLine, VerticalScrollbar, Window } from './dependencies';

export function registerRenderers() {
    PluginRegistry.addPlugin(new Browser());
    PluginRegistry.addPlugin(new Button());
    PluginRegistry.addPlugin(new ButtonBar());
    PluginRegistry.addPlugin(new Checkbox());
    PluginRegistry.addPlugin(new ComboBox());
    PluginRegistry.addPlugin(new Dropdown());
    PluginRegistry.addPlugin(new Grid());
    PluginRegistry.addPlugin(new Heading());
    PluginRegistry.addPlugin(new HorizontalLine());
    PluginRegistry.addPlugin(new HorizontalScrollbar());
    PluginRegistry.addPlugin(new Icon());
    PluginRegistry.addPlugin(new Image());
    PluginRegistry.addPlugin(new Label());
    PluginRegistry.addPlugin(new Link());
    PluginRegistry.addPlugin(new List());
    PluginRegistry.addPlugin(new Numeric());
    PluginRegistry.addPlugin(new Paragraph());
    PluginRegistry.addPlugin(new Phone());
    PluginRegistry.addPlugin(new Progress());
    PluginRegistry.addPlugin(new RadioButton());
    PluginRegistry.addPlugin(new Raster());
    PluginRegistry.addPlugin(new Rectangle());
    PluginRegistry.addPlugin(new Shape());
    PluginRegistry.addPlugin(new Slider());
    PluginRegistry.addPlugin(new Tablet());
    PluginRegistry.addPlugin(new Tabs());
    PluginRegistry.addPlugin(new TextArea());
    PluginRegistry.addPlugin(new TextInput());
    PluginRegistry.addPlugin(new Toggle());
    PluginRegistry.addPlugin(new VerticalLine());
    PluginRegistry.addPlugin(new VerticalScrollbar());
    PluginRegistry.addPlugin(new Window());
    PluginRegistry.addPlugin(new Comment());
}
