/**
 * Creates and returns a new object of a class. Partial args can be passed to the constructor by default
 * while the rest has to be supplied to the returned function.
 * @param Class
 * @param args
 * @returns
 */
export declare function create<T, C, K extends keyof C>(Class: new (args: C) => T, args: WithFns<Pick<C, K>, K>): (args2?: Omit<C, K> & Partial<Pick<C, K>>) => T;
/**
 * Creates and returns a new function with partial arguments.
 * The rest of the arguments must be supplied to the returned function.
 * @param fn
 * @param args
 * @returns
 */
export declare function createFn<T, C, K extends keyof C>(fn: (args: C) => T, args: WithFns<Pick<C, K>, K>): (args2?: Omit<C, K> & Partial<Pick<C, K>>) => T;
type WithFns<T, K extends keyof T> = {
    [P in keyof T]: P extends K ? T[P] | (() => T[P]) : T[P];
};
export declare function createArrayFn<T, C, K extends keyof C>(fn: (args: C) => T, args: Pick<C & {
    n: number;
}, K>): (args2?: Omit<C & {
    n: number;
}, K> & Partial<Pick<C & {
    n: number;
}, K>>) => T[];
export {};
