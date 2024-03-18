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
    get sum() {
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
}

/**
 * A set of primitives and terminals. Provides functionality to add Primitives and Terminals.
 */
export class PrimitiveSet {
    private content: { [key: string]: Primitive | Terminal | Argument } = {};
    public terminals: { [type: string]: (Terminal | Argument)[] } = {};
    public primitives: { [type: string]: Primitive[] } = {};
    private prims_count = 0;
    private terms_count = 0;
    private args_count = 0;

    constructor(
        public readonly name: string,
        public readonly in_type: string[],
        public readonly ret_type: string,
        public readonly arg_prefix: string = "ARG"
    ) {
        for (let type of in_type) {
            let arg_str = this.arg_prefix + this.args_count;
            this.addArgument(type, arg_str, this.args_count);
            this.args_count++;
        }
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
        in_types: string[],
        ret_type: string,
        name: string | undefined = undefined
    ) {
        if (name === undefined) name = primitive.toString();
        let prim = new Primitive(primitive, in_types, ret_type, name);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = prim;
        if (ret_type in this.primitives) {
            this.primitives[ret_type].push(prim);
        } else {
            this.primitives[ret_type] = [prim];
        }
        this.prims_count++;
    }

    /**
     * Add a terminal to the set.
     * @param terminal the terminal object
     * @param ret_type the type of the object
     * @param name the name of the terminal. Default is the `toString()` representation of the object.
     */
    addTerminal(terminal: Object, ret_type: string, name: string | undefined = undefined) {
        if (name === undefined) name = terminal.toString();
        let prim = new Terminal(terminal, ret_type, name);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = prim;
        if (ret_type in this.terminals) {
            this.terminals[ret_type].push(prim);
        } else {
            this.terminals[ret_type] = [prim];
        }
        this.terms_count++;
    }

    private addArgument(ret_type: string, name: string, id: number) {
        let arg = new Argument(ret_type, name, this.terms_count);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = arg;
        if (ret_type in this.terminals) {
            this.terminals[ret_type].push(arg);
        } else {
            this.terminals[ret_type] = [arg];
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
    public abstract readonly arity: number;
    /**
     * The input arguments types.
     */
    public abstract readonly in_types: string[];
    /**
     * The return type of the node.
     */
    public abstract readonly ret_type: string;
    /**
     * The function which the node represents.
     */
    public abstract readonly func: Function;
    /**
     * The name of the node.
     */
    public abstract name: string;
    /**
     * Return a formatted string representation of the node.
     * @param args the input arguments to format the node with
     */
    public abstract format(...args: string[]): string;
}

/**
 * A primitive node in a PrimitiveTree.
 */
class Primitive implements TreeNode {
    public readonly arity: number;
    constructor(
        public readonly func: Function,
        public readonly in_types: string[],
        public readonly ret_type: string,
        public name: string
    ) {
        this.arity = in_types.length;
    }

    public format(...args: string[]) {
        return this.name + "(" + args.join(", ") + ")";
    }
}

/**
 * A terminal node in a PrimitiveTree.
 */
class Terminal implements TreeNode {
    public readonly arity = 0;
    public readonly in_types: string[] = [];
    public readonly func = (...args: any[]) => {
        if (args.length > 0) console.warn("Terminal was called with arguments");
        this.obj;
    };
    constructor(private obj: Object, public readonly ret_type: string, public name: string) {}

    public format(...args: string[]) {
        if (args.length > 0) console.warn("Terminal was formatted with arguments");
        return this.name;
    }
}

class Argument implements TreeNode {
    public readonly arity = 0;
    public readonly in_types: string[] = [];
    public readonly func = (...args: any[]) => {
        if (args.length > 0) console.warn("Argument was called with arguments");
        return {};
    };
    constructor(
        public readonly ret_type: string,
        public name: string,
        public readonly id: number
    ) {}

    public format(...args: string[]) {
        if (args.length > 0) console.warn("Argument was formatted with arguments");
        return this.name;
    }
}

export class HallOfFame<T extends IHasFitness> {
    private content: T[] = [];

    constructor() {}

    update(individuals: T[]) {
        this.content.push(...individuals);
        this.content.sort((a, b) => b.fitness.sum - a.fitness.sum);
    }
}
