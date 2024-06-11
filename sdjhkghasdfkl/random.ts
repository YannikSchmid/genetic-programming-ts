/**
 * Get a random integer between min and max.
 * @param min
 * @param max
 * @returns
 */
export function randInt(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Get a random element from the array of choices.
 * @param choices An array of choices.
 * @returns A randomly choosen element from the array.
 */
export function choice<T>(choices: T[]) {
    var index = randInt(0, choices.length - 1);
    return choices[index];
}

/**
 * Get a random number between 0 and 1.
 * @returns A random number between 0 and 1.
 */
export function random() {
    return Math.random();
}

/**
 * Get `k` random elements from the array `samples`.
 * @param samples An array of samples.
 * @param k The number of elements to be choosen.
 * @returns An array of `k` randomly choosen elements from `samples`.
 */
export function sample<T>(samples: T[], k: number) {
    let arr = samples.slice();
    let shuffled: T[] = [];
    while (arr.length) {
        let index = randInt(0, arr.length);
        shuffled.push(...arr.splice(index, 1));
    }
    return shuffled.slice(0, k);
}
