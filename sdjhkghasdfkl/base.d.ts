export declare class Fitness {
    readonly weights: number[];
    wvalues: number[] | undefined;
    private pvalues;
    constructor(weights: number[]);
    /**
     * If the fitness has valid values.
     */
    get valid(): boolean;
    /**
     * The values of the fitness. If not set, is undefined.
     */
    get values(): number[] | undefined;
    /**
     * Set the values of the fitness. The length of the values must be the same as the weights.
     */
    set values(values: number[] | undefined);
    /**
     * Delete the values of the fitness.
     */
    deleteValues(): void;
    /**
     * Sum of the weighted values. 0 if no values are set.
     */
    get value(): number;
    /**
     * Clone the fitness and its values.
     */
    clone(): Fitness;
}
export interface IHasFitness {
    fitness: Fitness;
}
/**
 * A tree consisting of primitives and terminals, which together form a function.
 */
export declare class PrimitiveTree implements Iterable<TreeNode> {
    content: TreeNode[];
    fitness: Fitness;
    constructor(content: TreeNode[], fitness: Fitness);
    [Symbol.iterator](): IterableIterator<TreeNode>;
    /**
     * The length representing the number of nodes in the tree.
     */
    get length(): number;
    /**
     * Returns a copy of a section of the tree.
     * @returns a deep copy of the tree slice
     */
    slice(start?: number, end?: number): PrimitiveTree;
    /**
     * Returns iteratable of key-value pairs for the tree.
     * @returns
     */
    entries(): IterableIterator<[number, TreeNode]>;
    /**
     * Removes nodes from the tree and, if neccesarry, inserts new PrimNodes in their place and returns the removed nodes.
     * @param start the index at which to start removing nodes
     * @param deleteCount the number of nodes to remove
     * @param items the nodes to insert in place of the removed nodes
     * @returns the removed nodes
     */
    splice(start: number, deleteCount: number, ...items: TreeNode[]): TreeNode[];
    /**
     * Create and return a string representation of the tree.
     * @returns a string representation of the tree
     */
    toString(): string;
    /**
     * Get the composed function which is represented by the tree.
     * @returns the composed function
     */
    getFn(): (...args: any[]) => any;
    /**
     * Search the subtree of the tree which starts at the node with index `begin`.
     * @param begin the index of the node where the subtree starts
     * @returns the slice of the tree which represents the subtree
     */
    searchSubtree(begin: number): [begin: number, end: number];
    searchParent(nodeIndex: number): [parent: TreeNode, parentInputIndex: number];
}
/**
 * A set of primitives and terminals. Provides functionality to add Primitives and Terminals.
 */
export declare class PrimitiveSet {
    readonly name: string;
    readonly in_type: IType[];
    readonly ret_type: IType;
    readonly in_name?: string[] | undefined;
    private content;
    private terminals;
    private primitives;
    private prims_count;
    private terms_count;
    private args_count;
    constructor(name: string, in_type: IType[], ret_type: IType, in_name?: string[] | undefined);
    getCompatibleTerminals(type: IType): (Terminal | Argument)[];
    getCompatiblePrimitives(type: IType): Primitive[];
    /**
     * Add a primitive to the set.
     * @param primitive the function which the primitive represents
     * @param in_types the types of the input arguments as a list
     * @param ret_type the type of the return value
     * @param name the name of the primitive. Default is the `toString()` representation of the function.
     */
    addPrimitive(primitive: Function, in_types: IType[], ret_type: IType, name?: string | undefined, formatFn?: (name: string, ...args: string[]) => string): void;
    /**
     * Add a terminal to the set.
     * @param terminal the terminal object
     * @param ret_type the type of the object
     * @param name the name of the terminal. Default is the `toString()` representation of the object.
     */
    addTerminal(terminal: Object, ret_type: IType, name?: string | undefined): void;
    private addArgument;
    /**
     * The ratio of terminals to the total number of primitives and terminals.
     */
    get terminalRatio(): number;
}
/**
 * Abstract class for a node in a PrimitiveTree.
 */
export declare abstract class TreeNode {
    /**
     * The function which the node represents.
     */
    readonly func: Function;
    /**
     * The input arguments types.
     */
    readonly in_types: IType[];
    /**
     * The return type of the node.
     */
    readonly ret_type: IType;
    /**
     * The name of the node.
     */
    name: string;
    /**
     * The arity of the node = the number of input arguments the node takes. 0 for none / terminals.
     */
    readonly arity: number;
    constructor(
    /**
     * The function which the node represents.
     */
    func: Function, 
    /**
     * The input arguments types.
     */
    in_types: IType[], 
    /**
     * The return type of the node.
     */
    ret_type: IType, 
    /**
     * The name of the node.
     */
    name: string);
    /**
     * Return a formatted string representation of the node.
     * @param args the input arguments to format the node with
     */
    abstract format(...args: string[]): string;
    compatibleInputTypes(node: TreeNode): boolean;
}
/**
 * A primitive node in a PrimitiveTree.
 */
declare class Primitive extends TreeNode {
    formatFn: (name: string, ...args: string[]) => string;
    constructor(func: Function, in_types: IType[], ret_type: IType, name: string, formatFn: (name: string, ...args: string[]) => string);
    format(...args: string[]): string;
}
/**
 * A terminal node in a PrimitiveTree.
 */
declare class Terminal extends TreeNode {
    readonly arity = 0;
    constructor(obj: Object, ret_type: IType, name: string);
    format(...args: string[]): string;
}
declare class Argument extends TreeNode {
    readonly ret_type: IType;
    name: string;
    readonly id: number;
    constructor(ret_type: IType, name: string, id: number);
    format(...args: string[]): string;
}
export declare class HallOfFame<T extends IHasFitness> implements Iterable<T> {
    max_size: number;
    private content;
    constructor(max_size: number);
    update(population: T[]): void;
    clear(): void;
    [Symbol.iterator](): IterableIterator<T>;
    get length(): number;
    toString(): string;
}
export interface IType {
    /**
     * Wether this type is compatible with the given type. Does not have to hold for the opposite direction.
     * For example: string.isCompatible(any) -> true but any.isCompatible(string) -> false
     * @param type
     */
    isCompatible(type: IType): boolean;
    /**
     * A getter that returns a unique key of the type for equality checks.
     */
    get key(): string;
    copy(): IType;
}
export declare class LooselyType implements IType {
    isCompatible(type: LooselyType): boolean;
    get key(): string;
    copy(): LooselyType;
}
export declare class NameType implements IType {
    name: string;
    constructor(name: string);
    isCompatible(type: NameType): boolean;
    get key(): string;
    copy(): NameType;
}
export {};
