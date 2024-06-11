import { Individual } from "./tree";
import * as random from "./random";
import { HallOfFame } from "./util";
import { BehaviorSubject, Observable } from "rxjs";

type AllTools = {
    mate: (ind1: Individual, ind2: Individual) => [Individual, Individual];
    mutate: (ind: Individual) => Individual;
    eval: (ind: Individual) => number[];
    select: (individuals: Individual[], k: number) => Individual[];
    population: (size: number) => Individual[];
};

type Tools<K extends keyof AllTools> = Pick<AllTools, K>;

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
    population: Individual[],
    lambda: number,
    cxpb: number,
    mutpb: number,
    tools: Tools<"mate" | "mutate">
) {
    if (cxpb + mutpb > 1.0)
        throw new Error("The sum of cxpb and mutpb must be less than or equal to 1.0");

    let offspring: Individual[] = [];
    for (let i = 0; i < lambda; i++) {
        const op_choice = random.random();
        if (op_choice < cxpb) {
            // Apply crossover
            let [ind1, ind2] = random.sample(population, 2).map((ind) => ind.copy());
            [ind1, ind2] = tools.mate(ind1, ind2);
            ind1.fitness.deleteValues();
            offspring.push(ind1);
        } else if (op_choice < cxpb + mutpb) {
            // Apply mutation
            let ind = random.choice(population).copy();
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

export function eaMuPlusLambda(
    population: Individual[],
    mu: number,
    lambda: number,
    cxpb: number,
    mutpb: number,
    ngen: number,
    tools: Tools<"mate" | "mutate" | "eval" | "select">,
    hof?: HallOfFame
) {
    let invalid_ind = population.filter((ind) => !ind.fitness.valid);
    invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));

    if (hof) hof.update(population);

    for (let i = 0; i < ngen; i++) {
        let offspring = varOr(population, lambda, cxpb, mutpb, tools);
        let invalid_ind = offspring.filter((ind) => !ind.fitness.valid);
        invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
        if (hof) hof.update(offspring);
        population = tools.select(population.concat(offspring), mu);
    }

    return population;
}

export function eaOcl(
    population: Individual[],
    mu: number,
    lambda: number,
    cxpb: number,
    mutpb: number,
    sprinkle: number,
    nGen: number,
    tools: Tools<"mate" | "mutate" | "eval" | "select" | "population">,
    hof?: HallOfFame
) {
    return new Observable<number | Individual[]>((subscriber) => {
        async function helper() {
            evaluateInvalid(population, tools);
            if (hof) hof.update(population);
            for (let i = 0; i < nGen; i++) {
                let offspring = varOr(population, lambda, cxpb, mutpb, tools);
                population = offspring; //.concat(tools.population(sprinkle));
                //population = filterDuplicates(population);
                evaluateInvalid(population, tools);
                if (hof) hof.update(population);
                population = tools.select(population, mu);
                subscriber.next(i);
            }

            subscriber.next(population);
            subscriber.complete();
        }
        helper().then(() => {});
    });
}

function filterDuplicates(individuals: Individual[]) {
    const seen = new Set<string>();
    const ret: Individual[] = [];
    for (let ind of individuals) {
        if (seen.has(ind.toString())) continue;
        seen.add(ind.toString());
        ret.push(ind);
    }
    return ret;
}

function evaluateInvalid(individuals: Individual[], tools: Tools<"eval">) {
    let invalid_ind = individuals.filter((ind) => !ind.fitness.valid);
    invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
}
