/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

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
        public readonly options: string[],
    ) {
        super(name, label);

        Object.freeze(this);
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
