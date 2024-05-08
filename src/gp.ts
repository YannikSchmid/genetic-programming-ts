// Generation functions // --------------------------------------------------------------------------------

import { Individual, TreeNode } from "./tree";
import { Context } from "./context";
import * as random from "./random";
import { FunctionType, Type } from "./type";

/**
 * Generate an expression where each leaf has the same depth between `min` and `max`
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export function genFull(context: Context, type: Type, min: number, max: number) {
    function condition(height: number, depth: number) {
        return height === depth;
    }
    return generate(context, type, min, max, condition);
}

/**
 * Generate an expression where each leaf might have different a depth between `min` and `max`.
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export function genGrow(context: Context, type: Type, min: number, max: number) {
    function condition(height: number, depth: number) {
        return height === depth || (depth >= min && random.random() < 0.5);
    }
    return generate(context, type, min, max, condition);
}

/**
 * Generate an expression with either `gp.genGrow` or `gp.genFull` at random with equal probability.
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export function genHalfAndHalf(context: Context, type: Type, min: number, max: number) {
    return random.random() < 0.5
        ? genGrow(context, type, min, max)
        : genFull(context, type, min, max);
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
    context: Context,
    type: Type,
    min: number,
    max: number,
    condition: (height: number, depth: number) => boolean
) {
    let expr: TreeNode[] = [];
    const height = random.randInt(min, max);
    let stack: { depth: number; type: Type; context: Context }[] = [
        {
            depth: 0,
            type: type,
            context: context,
        },
    ];

    while (stack.length > 0) {
        let { depth, type, context } = stack.pop()!;
        if (type instanceof FunctionType) throw new Error("FunctionType not supported");

        if (condition(height, depth)) {
            // Terminal
            const prims = context.getPrimitives(true, type);
            try {
                const prim = random.weightedChoice(prims);
                //console.log("chose", prim[0], prim[1].toString());
                const node = new TreeNode(prim[1], [prim[0], context]);
                node.type.applyTo(type);
                //console.log("#######");
                expr.push(node);
            } catch (err) {
                throw new Error("No terminal available for type " + type + "; " + err);
            }
        } else {
            // Function
            try {
                const prims = context.getPrimitives(false, type);
                const prim = random.weightedChoice(prims);
                //console.log("chose", prim[0], prim[1].toString());
                const node = new TreeNode(prim[1], [prim[0], context]);
                node.type.applyTo(type);
                //console.log("nt", node.type.toString());
                //console.log("#######");
                expr.push(node);
                for (let inType of node.type.inputTypes.slice(1).reverse()) {
                    stack.push({
                        depth: depth + 1,
                        type: inType,
                        context: context.extend(node.contextExtension),
                    });
                }
                for (let inType of node.type.inputTypes.slice(0, 1).reverse()) {
                    stack.push({
                        depth: depth + 1,
                        type: inType,
                        context: context,
                    });
                }
            } catch (err) {
                // Terminal
                const prims = context.getPrimitives(true, type);
                try {
                    const prim = random.weightedChoice(prims);
                    console.log("chose", prim[0], prim[1].toString());
                    const node = new TreeNode(prim[1], [prim[0], context]);
                    node.type.applyTo(type);
                    console.log("#######");
                    expr.push(node);
                } catch (err) {
                    throw new Error("No terminal available for type " + type + "; " + err);
                }
            }
        }
    }
    return expr;
}

// Crossover functions // --------------------------------------------------------------------------------

export function cxOnePoint(ind1: Individual, ind2: Individual): [Individual, Individual] {
    if (ind1.size < 2 || ind2.size < 2) return [ind1, ind2]; // No crossover on single-node trees

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