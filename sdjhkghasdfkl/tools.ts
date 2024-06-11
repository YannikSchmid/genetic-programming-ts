import { IHasFitness } from "./base";
import { random, choice } from "./random";

/**
 * Select the `k` best individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the `k` best individuals.
 */
export function selBest<T extends IHasFitness>(individuals: T[], k: number) {
    return individuals.sort(compareFn(true)).slice(0, k);
}

/**
 * Select the `k` worst individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the `k` worst individuals.
 */
export function selWorst<T extends IHasFitness>(individuals: T[], k: number) {
    return individuals.sort(compareFn(false)).slice(0, k);
}

/**
 * Select `k` random individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns `k` random individuals.
 */
export function selRandom<T>(individuals: T[], k: number) {
    let chosen: T[] = [];
    for (let i = 0; i < k; i++) {
        chosen.push(choice(individuals));
    }
    return chosen;
}

/**
 * Select the best individual among `tournsize` randomly chosen individuals, `k` times.
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @param tournsize the number of individuals to be chosen for each tournament.
 * @returns the selected individuals.
 */
export function selTournament<T extends IHasFitness>(
    individuals: T[],
    k: number,
    tournsize: number
) {
    let chosen: T[] = [];
    for (let i = 0; i < k; i++) {
        let aspirants = selRandom(individuals, tournsize);
        chosen.push(aspirants.sort(compareFn(true))[0]);
    }
    return chosen;
}

/**
 * Select `k` individuals using `k` spins of a roulette.
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the selected individuals.
 */
export function selRoulette<T extends IHasFitness>(individuals: T[], k: number) {
    let sortedIndividuals = individuals.sort(compareFn(true));
    let fitnessSum = sortedIndividuals.reduce((acc, ind) => acc + ind.fitness.value, 0);
    let chosen: T[] = [];
    for (let i = 0; i < k; i++) {
        let r = random() * fitnessSum;
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

function compareFn<T extends IHasFitness>(reverse: boolean) {
    return (a: T, b: T) => {
        let result = a.fitness.value - b.fitness.value;
        return reverse ? -result : result;
    };
}
