//This file provides common functions for a quickstart

// Boolean operators // --------------------------------------------
export function and(a: boolean, b: boolean): boolean {
    return a && b;
}

export function or(a: boolean, b: boolean): boolean {
    return a || b;
}

export function not(a: boolean): boolean {
    return !a;
}

// Arithmetic operators // ---------------------------------------
export function add(a: number, b: number): number {
    return a + b;
}

export function sub(a: number, b: number): number {
    return a - b;
}

export function neg(a: number): number {
    return -a;
}

export function mul(a: number, b: number): number {
    return a * b;
}

export function div(a: number, b: number): number {
    return a / b;
}

export function mod(a: number, b: number): number {
    return a % b;
}

// Comparison operators // --------------------------------------
export function eq(a: number, b: number): boolean {
    return a === b;
}

export function neq(a: number, b: number): boolean {
    return a !== b;
}

export function gt(a: number, b: number): boolean {
    return a > b;
}

export function lt(a: number, b: number): boolean {
    return a < b;
}

export function ge(a: number, b: number): boolean {
    return a >= b;
}

export function le(a: number, b: number): boolean {
    return a <= b;
}

// Misc // -------------------------------------------------------

export function if_then_else(a: boolean, b: any, c: any): any {
    return a ? b : c;
}

export function max(a: number, b: number): number {
    return Math.max(a, b);
}

export function min(a: number, b: number): number {
    return Math.min(a, b);
}

export function abs(a: number): number {
    return Math.abs(a);
}

export function sqrt(a: number): number {
    return Math.sqrt(a);
}

export function log(a: number): number {
    return Math.log(a);
}
