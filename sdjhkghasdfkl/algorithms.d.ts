import { PrimitiveTree, HallOfFame } from "./base";
type AllTools = {
    mate: (ind1: PrimitiveTree, ind2: PrimitiveTree) => [PrimitiveTree, PrimitiveTree];
    mutate: (ind: PrimitiveTree) => PrimitiveTree;
    eval: (ind: PrimitiveTree) => number[];
    select: (individuals: PrimitiveTree[], k: number) => PrimitiveTree[];
};
type Tools<K extends keyof AllTools> = Pick<AllTools, K>;
/**
 * Applies crossover **and** mutation with the given probabilities on copies of the given individuals.
 * @param population A list of individuals to vary.
 * @param cxpb The probability of mating two individuals.
 * @param mutpb The probability of mutating an individual.
 * @param tools A tool object containing mate and mutate functions.
 * @returns A new list of varied individuals that are independent of the input individuals.
 */
export declare function varAnd(population: PrimitiveTree[], cxpb: number, mutpb: number, tools: Tools<"mate" | "mutate">): PrimitiveTree[];
/**
 * Applies reproduction **or** crossover **or** mutation with the given probabilities on copies of the given individuals.
 * @param population A list of individuals to vary.
 * @param lambda The number of offspring to produce.
 * @param cxpb The probability of mating two individuals.
 * @param mutpb The probability of mutating an individual.
 * @param tools A tool object containing mate and mutate functions.
 * @returns A new list of varied individuals that are independent of the input individuals.
 */
export declare function varOr(population: PrimitiveTree[], lambda: number, cxpb: number, mutpb: number, tools: Tools<"mate" | "mutate">): PrimitiveTree[];
/**
 * This is the `(\mu + \lambda)` evolutionary algorithm.
 * @param population A list of individuals to vary.
 * @param mu The number of individuals to select for the next generation.
 * @param lambda The number of offspring to produce at each generation.
 * @param cxpb The probability of mating two individuals.
 * @param mutpb The probability of mutating an individual.
 * @param ngen The number of generations.
 * @param tools A tool object containing mate, mutate, eval, and select functions.
 * @returns The final population.
 */
export declare function eaMuPlusLambda(population: PrimitiveTree[], mu: number, lambda: number, cxpb: number, mutpb: number, ngen: number, tools: Tools<"mate" | "mutate" | "eval" | "select">, hof?: HallOfFame<PrimitiveTree>): PrimitiveTree[];
export declare function eaMuCommaLambda(population: PrimitiveTree[], mu: number, lambda: number, cxpb: number, mutpb: number, ngen: number, tools: Tools<"mate" | "mutate" | "eval" | "select">, hof?: HallOfFame<PrimitiveTree>): PrimitiveTree[];
export {};
