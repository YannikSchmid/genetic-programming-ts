import seedrandom from "seedrandom";

const rng = seedrandom("30");

/**
 * Get a random integer between min and max.
 * @param min
 * @param max
 * @returns
 */
export function randInt(min: number, max: number) {
    return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Get a random element from the array of choices.
 * @param choices An array of choices.
 * @returns A randomly choosen element from the array.
 */
export function choice<T>(choices: T[]) {
    if (choices.length === 0) throw new Error("Choices must not be empty");
    var index = randInt(0, choices.length - 1);
    return choices[index];
}

export function weightedChoice<T>(choices: [T, number][]) {
    if (choices.length === 0) throw new Error("Choices must not be empty");
    let total = choices.reduce((acc, [_, weight]) => acc + weight, 0);
    let r = rng() * total;
    let sum = 0;
    for (let [choice, weight] of choices) {
        sum += weight;
        if (r < sum) return choice;
    }
    throw new Error("Should not happen");
}

/**
 * Get a random number between 0 and 1.
 * @returns A random number between 0 and 1.
 */
export function random() {
    return rng();
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
