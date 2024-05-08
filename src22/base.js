"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NameType = exports.LooselyType = exports.HallOfFame = exports.TreeNode = exports.PrimitiveSet = exports.PrimitiveTree = exports.Fitness = void 0;
const collections_1 = require("./collections");
const table_1 = require("table");
class Fitness {
    constructor(weights) {
        this.weights = weights;
    }
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
    set values(values) {
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
        var _a, _b;
        return (_b = (_a = this.wvalues) === null || _a === void 0 ? void 0 : _a.reduce((a, c) => a + c, 0)) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * Clone the fitness and its values.
     */
    clone() {
        return new Fitness(this.weights);
    }
}
exports.Fitness = Fitness;
/**
 * A tree consisting of primitives and terminals, which together form a function.
 */
class PrimitiveTree {
    constructor(content, fitness) {
        this.content = content;
        this.fitness = fitness;
    }
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
    slice(start, end) {
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
    splice(start, deleteCount, ...items) {
        return this.content.splice(start, deleteCount, ...items);
    }
    /**
     * Create and return a string representation of the tree.
     * @returns a string representation of the tree
     */
    toString() {
        let string = "";
        let stack = [];
        for (let node of this) {
            stack.push([node, []]);
            while (stack[stack.length - 1][1].length === stack[stack.length - 1][0].arity) {
                let [prim, args] = stack.pop();
                string = prim.format(...args);
                if (stack.length === 0)
                    break;
                stack[stack.length - 1][1].push(string);
            }
        }
        return string;
    }
    /**
     * Get the composed function which is represented by the tree.
     * @returns the composed function
     */
    getFn() {
        return ((...args) => {
            let fn = () => {
                console.log("lel");
            };
            let stack = [];
            for (let node of this) {
                stack.push([node, []]);
                while (stack[stack.length - 1][1].length === stack[stack.length - 1][0].arity) {
                    let [prim, fns] = stack.pop();
                    if (prim instanceof Argument) {
                        let id = prim.id;
                        fn = () => args[id];
                    }
                    else {
                        let values = fns.map((f) => f());
                        fn = () => prim.func(...values);
                    }
                    if (stack.length === 0)
                        break;
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
    searchSubtree(begin) {
        let end = begin + 1;
        let total = this.content[begin].arity;
        while (total > 0) {
            total += this.content[end].arity - 1;
            end++;
        }
        return [begin, end];
    }
    searchParent(nodeIndex) {
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
exports.PrimitiveTree = PrimitiveTree;
/**
 * A set of primitives and terminals. Provides functionality to add Primitives and Terminals.
 */
class PrimitiveSet {
    constructor(name, in_type, ret_type, in_name) {
        this.name = name;
        this.in_type = in_type;
        this.ret_type = ret_type;
        this.in_name = in_name;
        this.content = {};
        this.terminals = {};
        this.primitives = {};
        this.prims_count = 0;
        this.terms_count = 0;
        this.args_count = 0;
        const arg_prefix = "ARG";
        if (in_name !== undefined)
            if (in_name.length !== in_type.length)
                throw new Error("in_names must have the same length as in_type");
        for (let type of in_type) {
            let arg_str;
            if (in_name)
                arg_str = in_name[this.args_count];
            else
                arg_str = arg_prefix + this.args_count;
            this.addArgument(type, arg_str);
            this.args_count++;
        }
    }
    getCompatibleTerminals(type) {
        var _a, _b;
        return (_b = (_a = this.terminals[type.key]) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : [];
    }
    getCompatiblePrimitives(type) {
        var _a, _b;
        return (_b = (_a = this.primitives[type.key]) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : [];
    }
    /**
     * Add a primitive to the set.
     * @param primitive the function which the primitive represents
     * @param in_types the types of the input arguments as a list
     * @param ret_type the type of the return value
     * @param name the name of the primitive. Default is the `toString()` representation of the function.
     */
    addPrimitive(primitive, in_types, ret_type, name = undefined, formatFn = (name, ...args) => `${name}(${args.join(", ")})`) {
        if (name === undefined)
            name = primitive.toString();
        let prim = new Primitive(primitive, in_types, ret_type, name, formatFn);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = prim;
        if (ret_type.key in this.primitives) {
            this.primitives[ret_type.key][1].push(prim);
        }
        else {
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
    addTerminal(terminal, ret_type, name = undefined) {
        if (name === undefined)
            name = terminal.toString();
        let prim = new Terminal(terminal, ret_type, name);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = prim;
        if (ret_type.key in this.terminals) {
            this.terminals[ret_type.key][1].push(prim);
        }
        else {
            this.terminals[ret_type.key] = [ret_type, [prim]];
        }
        this.terms_count++;
    }
    addArgument(ret_type, name) {
        let arg = new Argument(ret_type, name, this.terms_count);
        if (name in this.content)
            throw new Error("Primitive or Terminal with name " + name + " already exists");
        this.content[name] = arg;
        if (ret_type.key in this.terminals) {
            this.terminals[ret_type.key][1].push(arg);
        }
        else {
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
exports.PrimitiveSet = PrimitiveSet;
/**
 * Abstract class for a node in a PrimitiveTree.
 */
class TreeNode {
    constructor(
    /**
     * The function which the node represents.
     */
    func, 
    /**
     * The input arguments types.
     */
    in_types, 
    /**
     * The return type of the node.
     */
    ret_type, 
    /**
     * The name of the node.
     */
    name) {
        this.func = func;
        this.in_types = in_types;
        this.ret_type = ret_type;
        this.name = name;
        this.arity = in_types.length;
    }
    compatibleInputTypes(node) {
        if (this.in_types.length !== node.in_types.length)
            return false;
        return this.in_types.every((it, index) => it.isCompatible(node.in_types[index]));
    }
}
exports.TreeNode = TreeNode;
/**
 * A primitive node in a PrimitiveTree.
 */
class Primitive extends TreeNode {
    constructor(func, in_types, ret_type, name, formatFn) {
        super(func, in_types, ret_type, name);
        this.formatFn = formatFn;
    }
    format(...args) {
        return this.formatFn(this.name, ...args);
    }
}
/**
 * A terminal node in a PrimitiveTree.
 */
class Terminal extends TreeNode {
    constructor(obj, ret_type, name) {
        let func = (...args) => {
            if (args.length > 0)
                console.warn("Terminal was called with arguments");
            obj;
        };
        super(func, [], ret_type, name);
        this.arity = 0;
    }
    format(...args) {
        if (args.length > 0)
            console.warn("Terminal was formatted with arguments");
        return this.name;
    }
}
class Argument extends TreeNode {
    constructor(ret_type, name, id) {
        let func = (...args) => {
            if (args.length > 0)
                console.warn("Argument was called with arguments");
            return {};
        };
        super(func, [], ret_type, name);
        this.ret_type = ret_type;
        this.name = name;
        this.id = id;
    }
    format(...args) {
        if (args.length > 0)
            console.warn("Argument was formatted with arguments");
        return this.name;
    }
}
class HallOfFame {
    constructor(max_size) {
        this.max_size = max_size;
        this.content = new collections_1.SortedList((a, b) => b.fitness.value - a.fitness.value);
    }
    update(population) {
        if (this.max_size <= 0)
            return;
        for (let ind of population) {
            if (this.content.length < this.max_size ||
                (this.content.getLast() !== undefined &&
                    ind.fitness.value > this.content.getLast().fitness.value)) {
                if (this.content.length >= this.max_size)
                    this.content.pop();
                this.content.insert(ind);
            }
        }
    }
    clear() {
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
            var _a;
            let strs = [
                idx + 1 + ".",
                ind.toString(),
                ((_a = ind.fitness.wvalues) === null || _a === void 0 ? void 0 : _a.map((v) => v.toPrecision(3)).toString()) || "",
            ];
            return strs;
        });
        let header = [
            ["Hall of Fame", "", ""],
            ["#", "Function", "Fitness"],
        ];
        return (0, table_1.table)(header.concat(data), {
            border: (0, table_1.getBorderCharacters)("norc"),
            spanningCells: [{ col: 0, row: 0, colSpan: 3 }],
        });
    }
}
exports.HallOfFame = HallOfFame;
class LooselyType {
    isCompatible(type) {
        return true;
    }
    get key() {
        return "any";
    }
    copy() {
        return new LooselyType();
    }
}
exports.LooselyType = LooselyType;
class NameType {
    constructor(name) {
        this.name = name;
    }
    isCompatible(type) {
        return this.name === type.name;
    }
    get key() {
        return this.name;
    }
    copy() {
        return new NameType(this.name);
    }
}
exports.NameType = NameType;
//# sourceMappingURL=base.js.map