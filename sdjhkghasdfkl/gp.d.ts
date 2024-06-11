import { PrimitiveTree, PrimitiveSet, TreeNode, IType } from "./base";
/**
 * Generate an expression where each leaf has the same depth between `min` and `max`
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export declare function genFull(pset: PrimitiveSet, min: number, max: number, type?: IType): TreeNode[];
/**
 * Generate an expression where each leaf might have different a depth between `min` and `max`.
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export declare function genGrow(pset: PrimitiveSet, min: number, max: number, type?: IType): TreeNode[];
/**
 * Generate an expression with either `gp.genGrow` or `gp.genFull` at random with equal probability.
 * @param pset Primitive Set from which primitives are selected
 * @param min Minimum depth of the expression
 * @param max Maximum depth of the expression
 * @param type Return type of the expression (optional). If not provided, the return type of the primitive set is used.
 * @returns A list of leaves representing the expression.
 */
export declare function genHalfAndHalf(pset: PrimitiveSet, min: number, max: number, type?: IType): TreeNode[];
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
export declare function generate(pset: PrimitiveSet, min: number, max: number, condition: (height: number, depth: number) => boolean, ret_type?: IType): TreeNode[];
export declare function cxOnePoint(ind1: PrimitiveTree, ind2: PrimitiveTree): [PrimitiveTree, PrimitiveTree];
/**
 *
 * @param ind1
 * @param ind2
 * @param termpb
 * @returns
 */
export declare function cxOnePointLeafBiased(ind1: PrimitiveTree, ind2: PrimitiveTree, termpb: number): [PrimitiveTree, PrimitiveTree];
/**
 * Randomly select a point in the tree *individual*, then replace the
 * subtree at that point as a root by the expression generated using method `expr`.
 * @param individual The individual to be mutated
 * @param expr A function that accepts a type and generates a new expression with that type as output type.
 * @returns The mutated individual
 */
export declare function mutUniform(individual: PrimitiveTree, expr: ExprFn): PrimitiveTree;
/**
 * Randomly select a point in the tree *individual*, then replace the point with a random primitive or terminal from the primitive set that fits the types.
 * @param individual The individual to be mutated
 * @param pset The primitive set from which primitives are selected
 * @returns The mutated individual
 */
export declare function mutNodeReplacement(individual: PrimitiveTree, pset: PrimitiveSet): PrimitiveTree | undefined;
export declare function mutInsert(individual: PrimitiveTree, pset: PrimitiveSet): void;
export declare function mutShrink(individual: PrimitiveTree, pset: PrimitiveSet): PrimitiveTree;
type ExprFn = (type?: IType) => TreeNode[];
export interface cxFunction {
    (ind1: PrimitiveTree, ind2: PrimitiveTree): [PrimitiveTree, PrimitiveTree];
}
export interface mutFunction {
    (ind: PrimitiveTree): PrimitiveTree;
}
export {};
