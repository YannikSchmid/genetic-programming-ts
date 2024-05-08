import * as tools from "../tools";
import * as base from "../base";
import * as gp from "../gp";
import * as algorithms from "../algorithms";
import pset from "./primitives";

const expr = (type?: base.IType) => gp.genFull(pset, 1, 2, type);
const fitness = () => new base.Fitness([20.0, -0.25]);
const tree = () => new base.PrimitiveTree(expr(), fitness());
const population = (n: number) => new Array(n).fill(undefined).map(tree);

// ARG0 - ARG1 = ARG2
// ARG1 + ARG2 = ARG0
// ARG0 - ARG2 = ARG1
const examples: { input: [any, any, any]; output: boolean }[] = [
    { input: [2, 1, 1], output: true },
    { input: [3, 2, 1], output: true },
    { input: [5, 1, 4], output: true },
    { input: [2, 2, 0], output: true },
    { input: [10, 2, 8], output: true },
    { input: [3, 2, 3], output: false },
    { input: [1, 2, 3], output: false },
    { input: [1, 2, 2], output: false },
    { input: [1, 1, 2], output: false },
];

function evalFn(individual: base.PrimitiveTree) {
    let func = individual.getFn();
    let right = 0;
    for (const example of examples) {
        if (func(...example.input) === example.output) {
            right++;
        }
    }
    return [right / examples.length, individual.length];
}

let toolfns = {
    mate: (ind1: base.PrimitiveTree, ind2: base.PrimitiveTree) => gp.cxOnePoint(ind1, ind2),
    mutate: (ind: base.PrimitiveTree) => gp.mutUniform(ind, expr),
    eval: evalFn,
    select: tools.selBest,
};

let pop = population(100);
let hof = new base.HallOfFame<base.PrimitiveTree>(10);
pop = algorithms.eaMuPlusLambda(pop, 100, 500, 0.3, 0.7, 100, toolfns, hof);
console.log("" + hof);
