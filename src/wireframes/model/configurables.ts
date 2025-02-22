/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SelectionConfiguration, Shape } from '../interface';

export abstract class Configurable {
    constructor(
        public readonly name: string,
        public readonly label: string,
    ) {
    }
}

export class TextConfigurable extends Configurable {
    constructor(name: string, label: string,
    ) {
        super(name, label);

        Object.freeze(this);
    }
}

export class ToggleConfigurable extends Configurable {
    constructor(name: string, label: string,
    ) {
        super(name, label);

        Object.freeze(this);
    }
}

export class SelectionConfigurable extends Configurable {
    constructor(name: string, label: string,
        public readonly options: string[] | ((shape: Shape)=>string[]),
        public config?: SelectionConfiguration,
    ) {
        super(name, label);

        Object.freeze(this);
    }

    public getOptions(shape: Shape) {
        return Array.isArray(this.options) ? this.options : this.options(shape);
    }
}

export class SliderConfigurable extends Configurable {
    constructor(name: string, label: string,
        public readonly min = 0,
        public readonly max = 100,
    ) {
        super(name, label);

        Object.freeze(this);
    }
}

export class NumberConfigurable extends Configurable {
    constructor(name: string, label: string,
        public readonly min = 0,
        public readonly max = 100,
    ) {
        super(name, label);

        Object.freeze(this);
    }
}

export class ColorConfigurable extends Configurable {
    constructor(name: string, label: string) {
        super(name, label);

        Object.freeze(this);
    }
}
