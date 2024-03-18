//This file provides common functions for a quickstart

// Boolean operators // --------------------------------------------
export function and(a: boolean, b: boolean): boolean {
    return a && b;
}
and.info = <Arg2Info>[["boolean", "boolean"], "boolean", "and"];

export function or(a: boolean, b: boolean): boolean {
    return a || b;
}
or.info = <Arg2Info>[["boolean", "boolean"], "boolean", "or"];

export function not(a: boolean): boolean {
    return !a;
}
not.info = <ArgInfo>[["boolean"], "boolean", "not"];

// Arithmetic operators // ---------------------------------------
export function add(a: number, b: number): number {
    return a + b;
}
add.info = <Arg2Info>[["number", "number"], "number", "add"];

export function sub(a: number, b: number): number {
    return a - b;
}
sub.info = <Arg2Info>[["number", "number"], "number", "sub"];

export function neg(a: number): number {
    return -a;
}
neg.info = <ArgInfo>[["number"], "number", "neg"];

export function mul(a: number, b: number): number {
    return a * b;
}
mul.info = <Arg2Info>[["number", "number"], "number", "mul"];

export function div(a: number, b: number): number {
    return a / b;
}
div.info = <Arg2Info>[["number", "number"], "number", "div"];

export function mod(a: number, b: number): number {
    return a % b;
}
mod.info = <Arg2Info>[["number", "number"], "number", "mod"];

// Comparison operators // --------------------------------------
export function eq(a: number, b: number): boolean {
    return a === b;
}
eq.info = <Arg2Info>[["number", "number"], "boolean", "eq"];

export function neq(a: number, b: number): boolean {
    return a !== b;
}
neq.info = <Arg2Info>[["number", "number"], "boolean", "neq"];

export function gt(a: number, b: number): boolean {
    return a > b;
}
gt.info = <Arg2Info>[["number", "number"], "boolean", "gt"];

export function lt(a: number, b: number): boolean {
    return a < b;
}
lt.info = <Arg2Info>[["number", "number"], "boolean", "lt"];

export function ge(a: number, b: number): boolean {
    return a >= b;
}
ge.info = <Arg2Info>[["number", "number"], "boolean", "ge"];

export function le(a: number, b: number): boolean {
    return a <= b;
}
le.info = <Arg2Info>[["number", "number"], "boolean", "le"];

// Misc // -------------------------------------------------------

export function if_then_else(a: boolean, b: any, c: any): any {
    return a ? b : c;
}
if_then_else.info = <Arg3Info>[["boolean", "any", "any"], "any", "if_then_else"];

export function max(a: number, b: number): number {
    return Math.max(a, b);
}
max.info = <Arg2Info>[["number", "number"], "number", "max"];

export function min(a: number, b: number): number {
    return Math.min(a, b);
}

min.info = <Arg2Info>[["number", "number"], "number", "min"];

export function abs(a: number): number {
    return Math.abs(a);
}
abs.info = <ArgInfo>[["number"], "number", "abs"];

export function sqrt(a: number): number {
    return Math.sqrt(a);
}
sqrt.info = <ArgInfo>[["number"], "number", "sqrt"];

export function log(a: number): number {
    return Math.log(a);
}
log.info = <ArgInfo>[["number"], "number", "log"];

type ArgInfo = [in_types: [string], ret_type: string, name: string];
type Arg2Info = [in_types: [string, string], ret_type: string, name: string];
type Arg3Info = [in_types: [string, string, string], ret_type: string, name: string];
