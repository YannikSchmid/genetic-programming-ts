import { SortedList } from "./collections";
import { table, getBorderCharacters } from "table";

export class Fitness {
    wvalues: number[] | undefined;
    private pvalues: number[] | undefined;

    constructor(public readonly weights: number[]) {}

    /**
     * If the fitness has valid values.
     */
    get valid() {
        return this.wvalues !== undefined;
    }

    /**
     * The values of the fitness. If not set, is undefined.
     */
    get values() {
        return this.pvalues;
    }

    /**
     * Set the values of the fitness. The length of the values must be the same as the weights.
     */
    set values(values: number[] | undefined) {
        if (values === undefined) {
            this.pvalues = undefined;
            this.wvalues = undefined;
            return;
        }
        if (values.length !== this.weights.length) {
            throw new Error("Values must have the same length as weights");
        }
        this.pvalues = values;
        this.wvalues = values.map((v, i) => v * this.weights[i]);
    }

    /**
     * Delete the values of the fitness.
     */
    deleteValues() {
        this.wvalues = undefined;
        this.pvalues = undefined;
    }

    /**
     * Sum of the weighted values. 0 if no values are set.
     */
    get value() {
        return this.wvalues?.reduce((a, c) => a + c, 0) ?? 0;
    }

    /**
     * Clone the fitness and its values.
     */
    clone() {
        return new Fitness(this.weights);
    }
}

export interface IHasFitness {
    fitness: Fitness;
}

/**
 * A tree consisting of primitives and terminals, which together form a function.
 */
export class PrimitiveTree implements Iterable<TreeNode> {
    constructor(public content: TreeNode[], public fitness: Fitness) {}

    [Symbol.iterator]() {
        return this.content[Symbol.iterator]();
    }

    /**
     * The length representing the number of nodes in the tree.
     */
    get length() {
        return this.content.length;
    }

    /**
     * Returns a copy of a section of the tree.
     * @returns a deep copy of the tree slice
     */
    public slice(start?: number, end?: number) {
        return new PrimitiveTree(this.content.slice(start, end), this.fitness.clone());
    }

    /**
     * Returns iteratable of key-value pairs for the tree.
     * @returns
     */
    entries() {
        return this.content.entries();
    }

    /**
     * Removes nodes from the tree and, if neccesarry, inserts new PrimNodes in their place and returns the removed nodes.
     * @param start the index at which to start removing nodes
     * @param deleteCount the number of nodes to remove
     * @param items the nodes to insert in place of the removed nodes
     * @returns the removed nodes
     */
    splice(start: number, deleteCount: number, ...items: TreeNode[]) {
        return this.content.splice(start, deleteCount, ...items);
    }

    /**
     * Create and return a string representation of the tree.
     * @returns a string representation of the tree
     */
    public toString() {
        let string = "";
        let stack: [TreeNode, string[]][] = [];
        for (let node of this) {
            stack.push([node, []]);
            while (stack[stack.length - 1][1].length === stack[stack.length - 1][0].arity) {
                let [prim, args] = stack.pop()!;
                string = prim.format(...args);
                if (stack.length === 0) break;
                stack[stack.length - 1][1].push(string);
            }
        }
        return string;
    }

    /**
     * Get the composed function which is represented by the tree.
     * @returns the composed function
     */
    public getFn() {
        return ((...args: any[]) => {
            let fn: Function = () => {
                console.log("lel");
            };
            let stack: [TreeNode, Function[]][] = [];
            for (let node of this) {
                stack.push([node, []]);
                while (stack[stack.length - 1][1].length === stack[stack.length - 1][0].arity) {
                    let [prim, fns] = stack.pop()!;
                    if (prim instanceof Argument) {
                        let id = prim.id;
                        fn = () => args[id];
                    } else {
                        let values: any[] = fns.map((f) => f());
                        fn = () => prim.func(...values);
                    }
                    if (stack.length === 0) break;
                    stack[stack.length - 1][1].push(fn);
                }
            }
            return fn();
        }).bind(this);
    }

    /**
     * Search the subtree of the tree which starts at the node with index `begin`.
     * @param begin the index of the node where the subtree starts
     * @returns the slice of the tree which represents the subtree
     */
    public searchSubtree(begin: number): [begin: number, end: number] {
        let end = begin + 1;
        let total = this.content[begin].arity;
        while (total > 0) {
            total += this.content[end].arity - 1;
            end++;
        }
        return [begin, end];
    }

    public searchParent(nodeIndex: number): [parent: TreeNode, parentInputIndex: number] {
        if (nodeIndex < 1 || nodeIndex >= this.length) {
            throw new Error("Lel dumm?");
        }
        let arity = 0;
        let node = this.content[nodeIndex];
        do {
            nodeIndex--;
            node = this.content[nodeIndex];
            arity--;
            arity += node.arity;
        } while (arity < 0);
        return [node, arity];
    }
}

/**
 * A set of primitives and terminals. Provides functionality to add Primitives and Terminals.
 */
export class PrimitiveSet {
    private content: { [key: string]: Primitive | Terminal | Argument } = {};
    private terminals: { [key: string]: [type: IType, terminal: (Terminal | Argument)[]] } = {};
    private primitives: { [key: string]: [type: IType, primitive: Primitive[]] } = {};
    private prims_count = 0;
    private terms_count = 0;
    private args_count = 0;

    constructor(
        public readonly name: string,
        public readonly in_type: IType[],
        public readonly ret_type: IType,
        public readonly in_name?: string[]
    ) {
        const arg_prefix = "ARG";
        if (in_name !== undefined)
            if (in_name.length !== in_type.length)
                throw new Error("in_names must have the same length as in_type");
        for (let type of in_type) {
            let arg_str: string;
            if (in_name) arg_str = in_name[this.args_count];
            else arg_str = arg_prefix + this.args_count;
            this.addArgument(type, arg_str);
            this.args_count++;
        }
    }

    getCompatibleTerminals(type: IType) {
        return this.terminals[type.key]?.[1] ?? [];
    }

    getCompatiblePrimitives(type: IType) {
        return this.primitives[type.key]?.[1] ?? [];
    }

    /**
     * Add a primitive to the set.
     * @param primitive the function which the primitive represents
     * @param in_types the types of the input arguments as a list
     * @param ret_type the type of the return value
     * @param name the name of the primitive. Default is the `toString()` representation of the function.
     */
    addPrimitive(
        primitive: Function,
        in_types: IType[],
        ret_type: IType,
        name: string | undefined = undefined,
        formatFn: (name: string, ...args: string[]) => string = (name, ...args) =>
            `${name}(${args.join(", ")})`
    ) {
        if (name === undefined) name = primitive.toString();
        let prim = new Primitive(primitive, in_types, ret_type, name, formatFn);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = prim;
        if (ret_type.key in this.primitives) {
            this.primitives[ret_type.key][1].push(prim);
        } else {
            this.primitives[ret_type.key] = [ret_type, [prim]];
        }
        this.prims_count++;
    }

    /**
     * Add a terminal to the set.
     * @param terminal the terminal object
     * @param ret_type the type of the object
     * @param name the name of the terminal. Default is the `toString()` representation of the object.
     */
    addTerminal(terminal: Object, ret_type: IType, name: string | undefined = undefined) {
        if (name === undefined) name = terminal.toString();
        let prim = new Terminal(terminal, ret_type, name);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = prim;
        if (ret_type.key in this.terminals) {
            this.terminals[ret_type.key][1].push(prim);
        } else {
            this.terminals[ret_type.key] = [ret_type, [prim]];
        }
        this.terms_count++;
    }

    private addArgument(ret_type: IType, name: string) {
        let arg = new Argument(ret_type, name, this.terms_count);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = arg;
        if (ret_type.key in this.terminals) {
            this.terminals[ret_type.key][1].push(arg);
        } else {
            this.terminals[ret_type.key] = [ret_type, [arg]];
        }
        this.terms_count++;
    }

    /**
     * The ratio of terminals to the total number of primitives and terminals.
     */
    get terminalRatio() {
        return this.terms_count / (this.terms_count + this.prims_count);
    }
}

/**
 * Abstract class for a node in a PrimitiveTree.
 */
export abstract class TreeNode {
    /**
     * The arity of the node = the number of input arguments the node takes. 0 for none / terminals.
     */
    public readonly arity: number;

    constructor(
        /**
         * The function which the node represents.
         */
        public readonly func: Function,
        /**
         * The input arguments types.
         */
        public readonly in_types: IType[],
        /**
         * The return type of the node.
         */
        public readonly ret_type: IType,
        /**
         * The name of the node.
         */
        public name: string
    ) {
        this.arity = in_types.length;
    }

    /**
     * Return a formatted string representation of the node.
     * @param args the input arguments to format the node with
     */
    public abstract format(...args: string[]): string;

    public compatibleInputTypes(node: TreeNode) {
        if (this.in_types.length !== node.in_types.length) return false;
        return this.in_types.every((it, index) => it.isCompatible(node.in_types[index]));
    }
}

/**
 * A primitive node in a PrimitiveTree.
 */
class Primitive extends TreeNode {
    constructor(
        func: Function,
        in_types: IType[],
        ret_type: IType,
        name: string,
        public formatFn: (name: string, ...args: string[]) => string
    ) {
        super(func, in_types, ret_type, name);
    }

    public format(...args: string[]) {
        return this.formatFn(this.name, ...args);
    }
}

/**
 * A terminal node in a PrimitiveTree.
 */
class Terminal extends TreeNode {
    public readonly arity = 0;
    constructor(obj: Object, ret_type: IType, name: string) {
        let func = (...args: any[]) => {
            if (args.length > 0) console.warn("Terminal was called with arguments");
            obj;
        };
        super(func, [], ret_type, name);
    }

    public format(...args: string[]) {
        if (args.length > 0) console.warn("Terminal was formatted with arguments");
        return this.name;
    }
}

class Argument extends TreeNode {
    constructor(public readonly ret_type: IType, public name: string, public readonly id: number) {
        let func = (...args: any[]) => {
            if (args.length > 0) console.warn("Argument was called with arguments");
            return {};
        };
        super(func, [], ret_type, name);
    }

    public format(...args: string[]) {
        if (args.length > 0) console.warn("Argument was formatted with arguments");
        return this.name;
    }
}

export class HallOfFame<T extends IHasFitness> implements Iterable<T> {
    private content: SortedList<T> = new SortedList<T>((a, b) => b.fitness.value - a.fitness.value);

    constructor(public max_size: number) {}

    update(population: T[]) {
        if (this.max_size <= 0) return;
        for (let ind of population) {
            if (
                this.content.length < this.max_size ||
                (this.content.getLast() !== undefined &&
                    ind.fitness.value > this.content.getLast()!.fitness.value)
            ) {
                if (this.content.length >= this.max_size) this.content.pop();
                this.content.insert(ind);
            }
        }
    }

    public clear() {
        this.content.clear();
    }

    [Symbol.iterator]() {
        return this.content[Symbol.iterator]();
    }

    get length() {
        return this.content.length;
    }

    toString() {
        const data = [...this.content].map((ind, idx) => {
            let strs: [string, string, string] = [
                idx + 1 + ".",
                ind.toString(),
                ind.fitness.wvalues?.map((v) => v.toPrecision(3)).toString() || "",
            ];
            return strs;
        });

        let header = [
            ["Hall of Fame", "", ""],
            ["#", "Function", "Fitness"],
        ];

        return table(header.concat(data), {
            border: getBorderCharacters("norc"),
            spanningCells: [{ col: 0, row: 0, colSpan: 3 }],
        });
    }
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

export class LooselyType implements IType {
    isCompatible(type: LooselyType) {
        return true;
    }

    get key() {
        return "any";
    }

    copy() {
        return new LooselyType();
    }
}

export class NameType implements IType {
    constructor(public name: string) {}

    isCompatible(type: NameType) {
        return this.name === type.name;
    }

    get key() {
        return this.name;
    }

    copy() {
        return new NameType(this.name);
    }
}
