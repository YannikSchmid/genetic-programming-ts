import { PrimitiveTree, PrimitiveSet, TreeNode, IType } from "./base";
import * as random from "./random";

// Generation functions // --------------------------------------------------------------------------------

/**
 * Generate an expression where each leaf has the same depth between `min` and `max`
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export function genFull(pset: PrimitiveSet, min: number, max: number, type?: IType) {
    function condition(height: number, depth: number) {
        return height === depth;
    }
    return generate(pset, min, max, condition, type);
}

/**
 * Generate an expression where each leaf might have different a depth between `min` and `max`.
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export function genGrow(pset: PrimitiveSet, min: number, max: number, type?: IType) {
    function condition(height: number, depth: number) {
        return height === depth || (depth >= min && random.random() < pset.terminalRatio);
    }
    return generate(pset, min, max, condition, type);
}

/**
 * Generate an expression with either `gp.genGrow` or `gp.genFull` at random with equal probability.
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export function genHalfAndHalf(pset: PrimitiveSet, min: number, max: number, type?: IType) {
    return random.random() < 0.5 ? genGrow(pset, min, max, type) : genFull(pset, min, max, type);
}

/**
 * Generate an expression (tree) as list of leaves in a depth-first manner. A leaf stops growing if the `condition` is met.
 * In this case it tries to grow another branch. The returned list of leaves can be used to create a `base.PrimitiveTree`.
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression.
 * @param max Maximum depth of the expression.
 * @param condition A function that takes two arguments: the height of the tree to build and the current depth of the expression and determines if the branch should stop growing.
 * @param ret_type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export function generate(
    pset: PrimitiveSet,
    min: number,
    max: number,
    condition: (height: number, depth: number) => boolean,
    ret_type?: IType
) {
    if (ret_type === undefined) ret_type = pset.ret_type;
    let expr: TreeNode[] = [];
    const height = random.randInt(min, max);
    let stack: [number, IType][] = [[0, ret_type]];
    while (stack.length > 0) {
        let [depth, type] = stack.pop()!;
        if (condition(height, depth)) {
            try {
                let term = random.choice(pset.getCompatibleTerminals(type));
                expr.push(term);
            } catch (err) {
                throw new Error("No terminal available for type " + type.key);
            }
        } else {
            try {
                let prim = random.choice(pset.getCompatiblePrimitives(type));
                expr.push(prim);
                for (let type of prim.in_types.slice().reverse()) {
                    stack.push([depth + 1, type]);
                }
            } catch (err) {
                throw new Error("No primitive available for type " + type.key);
            }
        }
    }
    return expr;
}

// Crossover functions // --------------------------------------------------------------------------------

export function cxOnePoint(
    ind1: PrimitiveTree,
    ind2: PrimitiveTree
): [PrimitiveTree, PrimitiveTree] {
    if (ind1.length < 2 || ind2.length < 2) return [ind1, ind2]; // No crossover on single-node trees

    let compatible_idx = getCompatibleIdx(ind1, ind2);
    if (compatible_idx.length === 0) return [ind1, ind2];

    let [idx1, idx2] = random.choice(compatible_idx);

    let slice1 = ind1.searchSubtree(idx1);
    let slice2 = ind2.searchSubtree(idx2);
    let subtree1 = ind1.slice(slice1[0], slice1[1]);
    let subtree2 = ind2.slice(slice2[0], slice2[1]);

    ind1.splice(slice1[0], slice1[1] - slice1[0], ...subtree2);
    ind2.splice(slice2[0], slice2[1] - slice2[0], ...subtree1);

    return [ind1, ind2];
}

/**
 *
 * @param ind1
 * @param ind2
 * @param termpb
 * @returns
 */
export function cxOnePointLeafBiased(
    ind1: PrimitiveTree,
    ind2: PrimitiveTree,
    termpb: number
): [PrimitiveTree, PrimitiveTree] {
    if (ind1.length === 0 || ind2.length === 0) return [ind1, ind2]; // No crossover on single-node trees
    let terminal_op = (a: number) => a === 0;
    let primitive_op = (a: number) => 0 < a;
    let arity_op1 = random.random() < termpb ? terminal_op : primitive_op;
    let arity_op2 = random.random() < termpb ? terminal_op : primitive_op;

    let compatible_idx = getCompatibleIdx(ind1, ind2, arity_op1, arity_op2);
    if (compatible_idx.length === 0) return [ind1, ind2];

    let [idx1, idx2] = random.choice(compatible_idx);

    let slice1 = ind1.searchSubtree(idx1);
    let slice2 = ind2.searchSubtree(idx2);
    let subtree1 = ind1.slice(slice1[0], slice1[1]);
    let subtree2 = ind2.slice(slice2[0], slice2[1]);

    ind1.splice(slice1[0], slice1[1] - slice1[0], ...subtree2);
    ind2.splice(slice2[0], slice2[1] - slice2[0], ...subtree1);

    return [ind1, ind2];
}

// Mutation functions // --------------------------------------------------------------------------------

/**
 * Randomly select a point in the tree *individual*, then replace the
 * subtree at that point as a root by the expression generated using method `expr`.
 * @param individual The individual to be mutated
 * @param expr A function that accepts a type and generates a new expression with that type as output type.
 * @returns The mutated individual
 */
export function mutUniform(individual: PrimitiveTree, expr: ExprFn) {
    let index = random.randInt(0, individual.length - 1);
    let slice = individual.searchSubtree(index);
    let type = individual.content[index].ret_type;
    individual.splice(slice[0], slice[1] - slice[0], ...expr(type));
    return individual;
}

/**
 * Randomly select a point in the tree *individual*, then replace the point with a random primitive or terminal from the primitive set that fits the types.
 * @param individual The individual to be mutated
 * @param pset The primitive set from which primitives are selected
 * @returns The mutated individual
 */
export function mutNodeReplacement(individual: PrimitiveTree, pset: PrimitiveSet) {
    if (individual.length < 2) return individual; // No mutation on single-node trees
    let index = random.randInt(1, individual.length - 1);
    let node = individual.content[index];
    if (node.arity === 0) {
        let term = random.choice(pset.getCompatibleTerminals(node.ret_type));
        individual.content[index] = term;
    } else {
        let prims = pset
            .getCompatiblePrimitives(node.ret_type)
            .filter((t) => t.compatibleInputTypes(node));
        individual.content[index] = random.choice(prims);
    }
}

//TODO: Finish implement mutInsert
export function mutInsert(individual: PrimitiveTree, pset: PrimitiveSet) {
    throw new Error("Not implemented");
    /*
    let index = random.randInt(0, individual.length - 1);
    let node = individual.content[index];
    let slice = individual.searchSubtree(index);

    let primitives = pset.primitives[node.ret_type].filter((x) =>
        x.in_types.includes(node.ret_type)
    );
    if (primitives.length === 0) return individual;
    let new_node = random.choice(primitives);
     */
}

export function mutShrink(individual: PrimitiveTree, pset: PrimitiveSet) {
    if (individual.length < 2) return individual; // No mutation on single-node trees

    let iprims: number[] = [];
    for (let [idx, node] of individual.slice(1).entries()) {
        if (node.arity > 0) iprims.push(idx);
    }

    if (iprims.length === 0) return individual;

    let index = random.choice(iprims);
    let prim = individual.content[index];
    let type = prim.ret_type;
    let terminal = random.choice(pset.getCompatibleTerminals(type));
    let subtree = individual.searchSubtree(index);
    individual.splice(subtree[0], subtree[1] - subtree[0], terminal);
    return individual;
}

// Private utility functions // --------------------------------------------------------------------------------
/*
function collectTypes(
    ind1: PrimitiveTree,
    ind2: PrimitiveTree,
    cond1?: (a: number) => boolean,
    cond2?: (a: number) => boolean
) {
    let types1 = new Collector<IType, number>();
    let types2 = new Collector<IType, number>();

    for (let [idx, node] of ind1.slice(1).entries()) {
        if (cond1 == undefined || cond1(node.arity)) types1.add(node.ret_type, idx);
    }

    for (let [idx, node] of ind2.slice(1).entries()) {
        if (cond2 == undefined || cond2(node.arity)) types2.add(node.ret_type, idx);
    }

    return [types1, types2];
}

function commonTypes(types1: Collector<IType, number>, types2: Collector<IType, number>) {
    return [...types1.keys()].filter((x) => types2.has(x));
}
*/
function getCompatibleIdx(
    ind1: PrimitiveTree,
    ind2: PrimitiveTree,
    cond1?: (a: number) => boolean,
    cond2?: (a: number) => boolean
) {
    let types1 = getTypes(ind1, cond1);
    let types2 = getTypes(ind2, cond2);

    let compatible_idx: [idx1: number, idx2: number][] = [];
    for (let [idx1, ret_type1, parent_in_type1] of types1) {
        for (let [idx2, ret_type2, parent_in_type2] of types2) {
            if (
                ret_type1.isCompatible(parent_in_type2) &&
                ret_type2.isCompatible(parent_in_type1)
            ) {
                compatible_idx.push([idx1, idx2]);
            }
        }
    }
    return compatible_idx;
}

function getTypes(ind: PrimitiveTree, cond?: (a: number) => boolean) {
    return [...ind.entries()]
        .filter(([idx, node]) => (cond == undefined || cond(node.arity)) && idx !== 0)
        .map<[index: number, ret_type: IType, parent_in_type: IType]>(([idx, node]) => {
            let [parent, inIndex] = ind.searchParent(idx);
            return [idx, node.ret_type, parent.in_types[inIndex]];
        });
}

type ExprFn = (type?: IType) => TreeNode[];

export interface cxFunction {
    (ind1: PrimitiveTree, ind2: PrimitiveTree): [PrimitiveTree, PrimitiveTree];
}

export interface mutFunction {
    (ind: PrimitiveTree): PrimitiveTree;
}
