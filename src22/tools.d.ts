import { IHasFitness } from "./base";
/**
 * Select the `k` best individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the `k` best individuals.
 */
export declare function selBest<T extends IHasFitness>(individuals: T[], k: number): T[];
/**
 * Select the `k` worst individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the `k` worst individuals.
 */
export declare function selWorst<T extends IHasFitness>(individuals: T[], k: number): T[];
/**
 * Select `k` random individuals
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns `k` random individuals.
 */
export declare function selRandom<T>(individuals: T[], k: number): T[];
/**
 * Select the best individual among `tournsize` randomly chosen individuals, `k` times.
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @param tournsize the number of individuals to be chosen for each tournament.
 * @returns the selected individuals.
 */
export declare function selTournament<T extends IHasFitness>(individuals: T[], k: number, tournsize: number): T[];
/**
 * Select `k` individuals using `k` spins of a roulette.
 * @param individuals the individuals to be selected from.
 * @param k the number of individuals to be selected.
 * @returns the selected individuals.
 */
export declare function selRoulette<T extends IHasFitness>(individuals: T[], k: number): T[];
