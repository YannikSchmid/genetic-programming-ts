"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sample = exports.random = exports.choice = exports.randInt = void 0;
/**
 * Get a random integer between min and max.
 * @param min
 * @param max
 * @returns
 */
function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
exports.randInt = randInt;
/**
 * Get a random element from the array of choices.
 * @param choices An array of choices.
 * @returns A randomly choosen element from the array.
 */
function choice(choices) {
    var index = randInt(0, choices.length - 1);
    return choices[index];
}
exports.choice = choice;
/**
 * Get a random number between 0 and 1.
 * @returns A random number between 0 and 1.
 */
function random() {
    return Math.random();
}
exports.random = random;
/**
 * Get `k` random elements from the array `samples`.
 * @param samples An array of samples.
 * @param k The number of elements to be choosen.
 * @returns An array of `k` randomly choosen elements from `samples`.
 */
function sample(samples, k) {
    let arr = samples.slice();
    let shuffled = [];
    while (arr.length) {
        let index = randInt(0, arr.length);
        shuffled.push(...arr.splice(index, 1));
    }
    return shuffled.slice(0, k);
}
exports.sample = sample;
//# sourceMappingURL=random.js.map