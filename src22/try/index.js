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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools = __importStar(require("../tools"));
const base = __importStar(require("../base"));
const gp = __importStar(require("../gp"));
const algorithms = __importStar(require("../algorithms"));
const primitives_1 = __importDefault(require("./primitives"));
const expr = (type) => gp.genFull(primitives_1.default, 1, 2, type);
const fitness = () => new base.Fitness([20.0, -0.25]);
const tree = () => new base.PrimitiveTree(expr(), fitness());
const population = (n) => new Array(n).fill(undefined).map(tree);
// ARG0 - ARG1 = ARG2
// ARG1 + ARG2 = ARG0
// ARG0 - ARG2 = ARG1
const examples = [
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
function evalFn(individual) {
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
    mate: (ind1, ind2) => gp.cxOnePoint(ind1, ind2),
    mutate: (ind) => gp.mutUniform(ind, expr),
    eval: evalFn,
    select: tools.selBest,
};
let pop = population(100);
let hof = new base.HallOfFame(10);
pop = algorithms.eaMuPlusLambda(pop, 100, 500, 0.3, 0.7, 100, toolfns, hof);
console.log("" + hof);
//# sourceMappingURL=index.js.map