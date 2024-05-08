import { PrimitiveTree, HallOfFame } from "./base";
import * as random from "./random";
import * as progress from "cli-progress";

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
export function varAnd(
    population: PrimitiveTree[],
    cxpb: number,
    mutpb: number,
    tools: Tools<"mate" | "mutate">
) {
    let offspring = population.map((ind) => ind.slice());
    for (let i = 0; i < population.length; i += 2) {
        let ind1 = population[i];
        let ind2 = population[i + 1];
        if (random.random() < cxpb) {
            // Apply crossover
            [ind1, ind2] = tools.mate(ind1, ind2);
            ind1.fitness.deleteValues();
            ind2.fitness.deleteValues();
        }
        if (random.random() < mutpb) {
            // Apply mutation
            ind1 = tools.mutate(ind1);
            ind2 = tools.mutate(ind2);
            ind1.fitness.deleteValues();
            ind2.fitness.deleteValues();
        }
    }
    return offspring;
}

/**
 * Applies reproduction **or** crossover **or** mutation with the given probabilities on copies of the given individuals.
 * @param population A list of individuals to vary.
 * @param lambda The number of offspring to produce.
 * @param cxpb The probability of mating two individuals.
 * @param mutpb The probability of mutating an individual.
 * @param tools A tool object containing mate and mutate functions.
 * @returns A new list of varied individuals that are independent of the input individuals.
 */
export function varOr(
    population: PrimitiveTree[],
    lambda: number,
    cxpb: number,
    mutpb: number,
    tools: Tools<"mate" | "mutate">
) {
    if (cxpb + mutpb > 1.0)
        throw new Error("The sum of cxpb and mutpb must be less than or equal to 1.0");

    let offspring: PrimitiveTree[] = [];
    for (let i = 0; i < lambda; i++) {
        const op_choice = random.random();
        if (op_choice < cxpb) {
            // Apply crossover
            let [ind1, ind2] = random.sample(population, 2).map((ind) => ind.slice());
            [ind1, ind2] = tools.mate(ind1, ind2);
            ind1.fitness.deleteValues();
            offspring.push(ind1);
        } else if (op_choice < cxpb + mutpb) {
            // Apply mutation
            let ind = random.choice(population).slice();
            ind = tools.mutate(ind);
            ind.fitness.deleteValues();
            offspring.push(ind);
        } else {
            // Apply reproduction
            offspring.push(random.choice(population));
        }
    }
    return offspring;
}

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
export function eaMuPlusLambda(
    population: PrimitiveTree[],
    mu: number,
    lambda: number,
    cxpb: number,
    mutpb: number,
    ngen: number,
    tools: Tools<"mate" | "mutate" | "eval" | "select">,
    hof?: HallOfFame<PrimitiveTree>
) {
    let invalid_ind = population.filter((ind) => !ind.fitness.valid);
    invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));

    if (hof) hof.update(population);

    const bar = new progress.SingleBar({}, progress.Presets.shades_classic);

    bar.start(ngen, 0);
    for (let i = 0; i < ngen; i++) {
        bar.increment();

        let offspring = varOr(population, lambda, cxpb, mutpb, tools);
        let invalid_ind = offspring.filter((ind) => !ind.fitness.valid);
        invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
        if (hof) hof.update(offspring);
        population = tools.select(population.concat(offspring), mu);
    }
    bar.stop();

    return population;
}

export function eaMuCommaLambda(
    population: PrimitiveTree[],
    mu: number,
    lambda: number,
    cxpb: number,
    mutpb: number,
    ngen: number,
    tools: Tools<"mate" | "mutate" | "eval" | "select">,
    hof?: HallOfFame<PrimitiveTree>
) {
    let invalid_ind = population.filter((ind) => !ind.fitness.valid);
    invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));

    if (hof) hof.update(population);

    const bar = new progress.SingleBar({}, progress.Presets.shades_classic);

    bar.start(ngen, 0);
    for (let i = 0; i < ngen; i++) {
        bar.increment();

        let offspring = varOr(population, lambda, cxpb, mutpb, tools);
        let invalid_ind = offspring.filter((ind) => !ind.fitness.valid);
        invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
        if (hof) hof.update(offspring);
        population = tools.select(offspring, mu);
    }
    bar.stop();

    return population;
}
