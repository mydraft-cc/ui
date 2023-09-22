/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export type ConfigurableBase = { name: string; label: string };

export type Configurable = ColorConfigurable | NumberConfigurable | SelectionConfigurable | SliderConfigurable | TextConfigurable | ToggleConfigurable;

export type ColorConfigurable = { type: 'Color' } & ConfigurableBase;

export type NumberConfigurable = { type: 'Number'; min: number; max: number } & ConfigurableBase;

export type SelectionConfigurable = { type: 'Selection'; options: string[] } & ConfigurableBase;

export type SliderConfigurable = { type: 'Slider'; min: number; max: number } & ConfigurableBase;

export type TextConfigurable = { type: 'Text' } & ConfigurableBase;

export type ToggleConfigurable = { type: 'Toggle' } & ConfigurableBase;
