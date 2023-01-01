/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export module MathHelper {
    let CURRENT_ID = new Date().getTime();

    export function nextId() {
        CURRENT_ID++;

        return CURRENT_ID.toString();
    }

    export function guid() {
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    export function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    export function toRad(degree: number) {
        return degree * Math.PI / 180;
    }

    export function toDegree(rad: number) {
        return rad * 180 / Math.PI;
    }

    export function roundToMultipleOf(value: number, factor: number) {
        return Math.round(value / factor) * factor;
    }

    export function roundToMultipleOfTwo(value: number) {
        return Math.round(value / 2) * 2;
    }

    export function toPositiveDegree(degree: number) {
        while (degree < 0) {
            degree += 360;
        }

        while (degree >= 360) {
            degree -= 360;
        }

        return degree;
    }
}
