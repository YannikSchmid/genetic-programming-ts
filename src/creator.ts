/**
 * Creates and returns a new object of a class. Partial args can be passed to the constructor by default
 * while the rest has to be supplied to the returned function.
 * @param Class
 * @param args
 * @returns
 */
export function create<T, C, K extends keyof C>(
    Class: new (args: C) => T,
    args: WithFns<Pick<C, K>, K>
) {
    return (args2?: Omit<C, K> & Partial<Pick<C, K>>) => {
        let args3 = callAttributes({ ...args, ...args2 } as C);
        return new Class(args3);
    };
}

/**
 * Creates and returns a new function with partial arguments.
 * The rest of the arguments must be supplied to the returned function.
 * @param fn
 * @param args
 * @returns
 */
export function createFn<T, C, K extends keyof C>(
    fn: (args: C) => T,
    args: WithFns<Pick<C, K>, K>
) {
    return (args2?: Omit<C, K> & Partial<Pick<C, K>>) => {
        let args3 = callAttributes({ ...args, ...args2 } as C);
        return fn(args3);
    };
}

type WithFns<T, K extends keyof T> = {
    [P in keyof T]: P extends K ? T[P] | (() => T[P]) : T[P];
};

function callAttributes<C>(args: C) {
    let ret = {} as C;
    for (const key in args) {
        let value = args[key];
        if (typeof value === "function") {
            ret[key] = value();
        } else ret[key] = value;
    }
    return ret;
}

export function createArrayFn<T, C, K extends keyof C>(
    fn: (args: C) => T,
    args: Pick<C & { n: number }, K>
) {
    args = callAttributes(args);
    return (args2?: Omit<C & { n: number }, K> & Partial<Pick<C & { n: number }, K>>) => {
        let arr: T[] = [];
        let args3 = { ...args, ...args2 } as C & { n: number };
        for (let i = 0; i < args3.n; i++) {
            arr.push(fn(args3));
        }
        return arr;
    };
}
