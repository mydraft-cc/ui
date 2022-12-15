/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export class Timer {
    private timeout: any;
    private interval: any;

    constructor(action: () => void, interval: number, initialDelay = 0) {
        if (initialDelay > 0) {
            this.timeout = setTimeout(() => {
                this.interval = setInterval(action, interval);
            }, initialDelay);
        } else {
            this.interval = setInterval(action, interval);
        }
    }

    public destroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}