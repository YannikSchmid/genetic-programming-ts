"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eaMuCommaLambda = exports.eaMuPlusLambda = exports.varOr = exports.varAnd = void 0;
const random = __importStar(require("./random"));
const progress = __importStar(require("cli-progress"));
/**
 * Applies crossover **and** mutation with the given probabilities on copies of the given individuals.
 * @param population A list of individuals to vary.
 * @param cxpb The probability of mating two individuals.
 * @param mutpb The probability of mutating an individual.
 * @param tools A tool object containing mate and mutate functions.
 * @returns A new list of varied individuals that are independent of the input individuals.
 */
function varAnd(population, cxpb, mutpb, tools) {
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
exports.varAnd = varAnd;
/**
 * Applies reproduction **or** crossover **or** mutation with the given probabilities on copies of the given individuals.
 * @param population A list of individuals to vary.
 * @param lambda The number of offspring to produce.
 * @param cxpb The probability of mating two individuals.
 * @param mutpb The probability of mutating an individual.
 * @param tools A tool object containing mate and mutate functions.
 * @returns A new list of varied individuals that are independent of the input individuals.
 */
function varOr(population, lambda, cxpb, mutpb, tools) {
    if (cxpb + mutpb > 1.0)
        throw new Error("The sum of cxpb and mutpb must be less than or equal to 1.0");
    let offspring = [];
    for (let i = 0; i < lambda; i++) {
        const op_choice = random.random();
        if (op_choice < cxpb) {
            // Apply crossover
            let [ind1, ind2] = random.sample(population, 2).map((ind) => ind.slice());
            [ind1, ind2] = tools.mate(ind1, ind2);
            ind1.fitness.deleteValues();
            offspring.push(ind1);
        }
        else if (op_choice < cxpb + mutpb) {
            // Apply mutation
            let ind = random.choice(population).slice();
            ind = tools.mutate(ind);
            ind.fitness.deleteValues();
            offspring.push(ind);
        }
        else {
            // Apply reproduction
            offspring.push(random.choice(population));
        }
    }
    return offspring;
}
exports.varOr = varOr;
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
function eaMuPlusLambda(population, mu, lambda, cxpb, mutpb, ngen, tools, hof) {
    let invalid_ind = population.filter((ind) => !ind.fitness.valid);
    invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
    if (hof)
        hof.update(population);
    const bar = new progress.SingleBar({}, progress.Presets.shades_classic);
    bar.start(ngen, 0);
    for (let i = 0; i < ngen; i++) {
        bar.increment();
        let offspring = varOr(population, lambda, cxpb, mutpb, tools);
        let invalid_ind = offspring.filter((ind) => !ind.fitness.valid);
        invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
        if (hof)
            hof.update(offspring);
        population = tools.select(population.concat(offspring), mu);
    }
    bar.stop();
    return population;
}
exports.eaMuPlusLambda = eaMuPlusLambda;
function eaMuCommaLambda(population, mu, lambda, cxpb, mutpb, ngen, tools, hof) {
    let invalid_ind = population.filter((ind) => !ind.fitness.valid);
    invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
    if (hof)
        hof.update(population);
    const bar = new progress.SingleBar({}, progress.Presets.shades_classic);
    bar.start(ngen, 0);
    for (let i = 0; i < ngen; i++) {
        bar.increment();
        let offspring = varOr(population, lambda, cxpb, mutpb, tools);
        let invalid_ind = offspring.filter((ind) => !ind.fitness.valid);
        invalid_ind.forEach((ind) => (ind.fitness.values = tools.eval(ind)));
        if (hof)
            hof.update(offspring);
        population = tools.select(offspring, mu);
    }
    bar.stop();
    return population;
}
exports.eaMuCommaLambda = eaMuCommaLambda;
//# sourceMappingURL=algorithms.js.map