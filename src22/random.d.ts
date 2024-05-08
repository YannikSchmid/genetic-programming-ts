/**
 * Get a random integer between min and max.
 * @param min
 * @param max
 * @returns
 */
export declare function randInt(min: number, max: number): number;
/**
 * Get a random element from the array of choices.
 * @param choices An array of choices.
 * @returns A randomly choosen element from the array.
 */
export declare function choice<T>(choices: T[]): T;
/**
 * Get a random number between 0 and 1.
 * @returns A random number between 0 and 1.
 */
export declare function random(): number;
/**
 * Get `k` random elements from the array `samples`.
 * @param samples An array of samples.
 * @param k The number of elements to be choosen.
 * @returns An array of `k` randomly choosen elements from `samples`.
 */
export declare function sample<T>(samples: T[], k: number): T[];
