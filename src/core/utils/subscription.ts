/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export class Subscription<T> {
    private readonly subscribers: ((value: T) => void)[] = [];
    private lastValue?: { value: T };

    public next(value: T) {
        for (const subscriber of this.subscribers) {
            subscriber(value);
        }

        this.lastValue = { value };
    }

    public subscribe(subscription: (value: T) => void) {
        this.subscribers.push(subscription);

        const lastValue = this.lastValue;

        if (lastValue) {
            subscription(lastValue.value);
        }

        return () => {
            this.subscribers.splice(this.subscribers.indexOf(subscription));
        };
    }
}