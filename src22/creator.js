"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArrayFn = exports.createFn = exports.create = void 0;
/**
 * Creates and returns a new object of a class. Partial args can be passed to the constructor by default
 * while the rest has to be supplied to the returned function.
 * @param Class
 * @param args
 * @returns
 */
function create(Class, args) {
    return (args2) => {
        let args3 = callAttributes(Object.assign(Object.assign({}, args), args2));
        return new Class(args3);
    };
}
exports.create = create;
/**
 * Creates and returns a new function with partial arguments.
 * The rest of the arguments must be supplied to the returned function.
 * @param fn
 * @param args
 * @returns
 */
function createFn(fn, args) {
    return (args2) => {
        let args3 = callAttributes(Object.assign(Object.assign({}, args), args2));
        return fn(args3);
    };
}
exports.createFn = createFn;
function callAttributes(args) {
    let ret = {};
    for (const key in args) {
        let value = args[key];
        if (typeof value === "function") {
            ret[key] = value();
        }
        else
            ret[key] = value;
    }
    return ret;
}
function createArrayFn(fn, args) {
    args = callAttributes(args);
    return (args2) => {
        let arr = [];
        let args3 = Object.assign(Object.assign({}, args), args2);
        for (let i = 0; i < args3.n; i++) {
            arr.push(fn(args3));
        }
        return arr;
    };
}
exports.createArrayFn = createArrayFn;
//# sourceMappingURL=creator.js.map