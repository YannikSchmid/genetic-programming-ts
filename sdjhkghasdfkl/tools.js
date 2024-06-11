"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selRoulette = exports.selTournament = exports.selRandom = exports.selWorst = exports.selBest = void 0;
const random_1 = require("./random");
/**
 * Select the `k` best individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the `k` best individuals.
 */
function selBest(individuals, k) {
    return individuals.sort(compareFn(true)).slice(0, k);
}
exports.selBest = selBest;
/**
 * Select the `k` worst individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the `k` worst individuals.
 */
function selWorst(individuals, k) {
    return individuals.sort(compareFn(false)).slice(0, k);
}
exports.selWorst = selWorst;
/**
 * Select `k` random individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns `k` random individuals.
 */
function selRandom(individuals, k) {
    let chosen = [];
    for (let i = 0; i < k; i++) {
        chosen.push((0, random_1.choice)(individuals));
    }
    return chosen;
}
exports.selRandom = selRandom;
/**
 * Select the best individual among `tournsize` randomly chosen individuals, `k` times.
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @param tournsize the number of individuals to be chosen for each tournament.
 * @returns the selected individuals.
 */
function selTournament(individuals, k, tournsize) {
    let chosen = [];
    for (let i = 0; i < k; i++) {
        let aspirants = selRandom(individuals, tournsize);
        chosen.push(aspirants.sort(compareFn(true))[0]);
    }
    return chosen;
}
exports.selTournament = selTournament;
/**
 * Select `k` individuals using `k` spins of a roulette.
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the selected individuals.
 */
function selRoulette(individuals, k) {
    let sortedIndividuals = individuals.sort(compareFn(true));
    let fitnessSum = sortedIndividuals.reduce((acc, ind) => acc + ind.fitness.value, 0);
    let chosen = [];
    for (let i = 0; i < k; i++) {
        let r = (0, random_1.random)() * fitnessSum;
        let acc = 0;
        for (let ind of sortedIndividuals) {
            acc += ind.fitness.value;
            if (acc >= r) {
                chosen.push(ind);
                break;
            }
        }
    }
    return chosen;
}
exports.selRoulette = selRoulette;
function compareFn(reverse) {
    return (a, b) => {
        let result = a.fitness.value - b.fitness.value;
        return reverse ? -result : result;
    };
}
//# sourceMappingURL=tools.js.map