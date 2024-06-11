"use strict";
//This file provides common functions for a quickstart
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.sqrt = exports.abs = exports.min = exports.max = exports.if_then_else = exports.le = exports.ge = exports.lt = exports.gt = exports.neq = exports.eq = exports.mod = exports.div = exports.mul = exports.neg = exports.sub = exports.add = exports.not = exports.or = exports.and = void 0;
// Boolean operators // --------------------------------------------
function and(a, b) {
    return a && b;
}
exports.and = and;
function or(a, b) {
    return a || b;
}
exports.or = or;
function not(a) {
    return !a;
}
exports.not = not;
// Arithmetic operators // ---------------------------------------
function add(a, b) {
    return a + b;
}
exports.add = add;
function sub(a, b) {
    return a - b;
}
exports.sub = sub;
function neg(a) {
    return -a;
}
exports.neg = neg;
function mul(a, b) {
    return a * b;
}
exports.mul = mul;
function div(a, b) {
    return a / b;
}
exports.div = div;
function mod(a, b) {
    return a % b;
}
exports.mod = mod;
// Comparison operators // --------------------------------------
function eq(a, b) {
    return a === b;
}
exports.eq = eq;
function neq(a, b) {
    return a !== b;
}
exports.neq = neq;
function gt(a, b) {
    return a > b;
}
exports.gt = gt;
function lt(a, b) {
    return a < b;
}
exports.lt = lt;
function ge(a, b) {
    return a >= b;
}
exports.ge = ge;
function le(a, b) {
    return a <= b;
}
exports.le = le;
// Misc // -------------------------------------------------------
function if_then_else(a, b, c) {
    return a ? b : c;
}
exports.if_then_else = if_then_else;
function max(a, b) {
    return Math.max(a, b);
}
exports.max = max;
function min(a, b) {
    return Math.min(a, b);
}
exports.min = min;
function abs(a) {
    return Math.abs(a);
}
exports.abs = abs;
function sqrt(a) {
    return Math.sqrt(a);
}
exports.sqrt = sqrt;
function log(a) {
    return Math.log(a);
}
exports.log = log;
//# sourceMappingURL=quickfns.js.map