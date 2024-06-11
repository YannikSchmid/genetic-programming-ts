import { Context, ContextExtension } from "./context";
import { MapFunctionType, Type } from "./type";

export class Individual {
    /**
     * Array of parent indeces for each node in the tree. [index of parent, index of parent input]
     */
    public readonly hierarchy: { parent: number; arg: number }[] = [];
    private readonly tree: TreeNode[];
    public fitness: Fitness;
    constructor(
        tree: TreeNode[] | ((type: Type, context: Context) => TreeNode[]),
        public baseContext: Context,
        private readonly type: Type,
        weights: number[]
    ) {
        if (this.type === undefined) throw new Error("Type must be defined");
        if (tree instanceof Array) {
            this.tree = tree;
        } else {
            this.tree = tree(this.type, baseContext);
        }
        this.buildHierarchy();
        this.fitness = new Fitness(weights);
    }

    get size() {
        return this.tree.length;
    }

    private buildHierarchy() {
        this.hierarchy.push({ parent: -1, arg: -1 });
        for (let i = 1; i < this.tree.length; i++) {
            let index = i;
            let acc_arity = 0;
            do {
                index--;
                if (index < 0) throw new Error("Invalid tree built");
                acc_arity += this.tree[index].type.arity - 1;
            } while (acc_arity < 0);
            this.hierarchy.push({
                parent: index,
                arg: this.tree[index].type.arity - acc_arity - 1,
            });
        }
    }

    /** Throws an error if a tree index is not valid */
    private checkValidIndex(index: number) {
        if (index < 0 || index >= this.size) {
            throw new Error("Index out of bounds");
        }
    }

    public getParentInputType(index: number) {
        this.checkValidIndex(index);
        const data = this.hierarchy[index];
        if (data.parent === -1) return this.type;
        return this.tree[data.parent].type.inputTypes[data.arg];
    }

    /**
     * Get the available context of the node, which includes possible context extensions by parent nodes.
     * @param index The index of the node
     * @returns the context of the node
     */
    public getNodeContext(index: number) {
        this.checkValidIndex(index);
        let arg = this.hierarchy[index].arg;
        let ind = this.hierarchy[index].parent;
        let context = this.baseContext;
        while (ind >= 0) {
            context = context.extend(this.tree[ind].getContextExtension(arg));
            arg = this.hierarchy[ind].arg;
            ind = this.hierarchy[ind].parent;
        }
        return context;
    }

    /**
     * Create and return a string representation of the tree.
     * @returns a string representation of the tree
     */
    public toString() {
        let string = "";
        let stack: [TreeNode, string[]][] = [];
        for (let node of this.tree) {
            stack.push([node, []]);
            while (stack[stack.length - 1][1].length === stack[stack.length - 1][0].type.arity) {
                let [prim, args] = stack.pop()!;
                string = prim.format(...args);
                if (stack.length === 0) break;
                stack[stack.length - 1][1].push(string);
            }
        }
        return string;
    }

    public toTypeString() {
        let string = "";
        let stack: [TreeNode, string[]][] = [];
        for (let node of this.tree) {
            stack.push([node, []]);
            while (stack[stack.length - 1][1].length === stack[stack.length - 1][0].type.arity) {
                let [prim, args] = stack.pop()!;
                if (args.length > 0) string = prim.type.toString() + "{ " + args.join(" ! ") + " }";
                else string = prim.type.toString();
                if (stack.length === 0) break;
                stack[stack.length - 1][1].push(string);
            }
        }
        return string;
    }

    private searchSubtree(begin: number): [begin: number, end: number] {
        let end = begin + 1;
        let total = this.tree[begin].type.arity;
        while (total > 0) {
            total += this.tree[end].type.arity - 1;
            end++;
        }
        return [begin, end];
    }
    public getCompatibleSwaps(ind: Individual, nodeCondition?: (n: TreeNode) => boolean) {
        const compatible_idx: [number, number][] = [];
        for (let [s, snode] of this.tree.entries()) {
            if (nodeCondition && !nodeCondition(snode)) continue;
            let selfRecType = this.getParentInputType(s);
            let selfContext = this.getNodeContext(s);
            let selfGivType = snode.type;
            for (let [i, inode] of ind.tree.entries()) {
                if (i === 0 && s === 0) continue; // Skip root nodes
                if (nodeCondition && !nodeCondition(inode)) continue;
                let indRecType = ind.getParentInputType(i);
                let indRecContext = ind.getNodeContext(i);
                let indGivType = inode.type;
                if (
                    selfContext.isCompatible(indRecContext) &&
                    selfRecType.isCompatibleWith(indGivType) &&
                    indRecType.isCompatibleWith(selfGivType)
                ) {
                    compatible_idx.push([s, i]);
                }
            }
        }
        return compatible_idx;
    }

    public swapSubtrees(idx: number, ind: Individual, iidx: number) {
        const slice = this.searchSubtree(idx);
        const islice = ind.searchSubtree(iidx);
        const temp = this.tree.slice(slice[0], slice[1]);
        this.tree.splice(slice[0], slice[1] - slice[0], ...ind.tree.slice(islice[0], islice[1]));
        ind.tree.splice(islice[0], islice[1] - islice[0], ...temp);
        this.buildHierarchy();
    }

    public getNode(idx: number) {
        return this.tree[idx];
    }

    public getNodes(condition: (node: TreeNode) => boolean) {
        return this.tree
            .map((node, idx) => {
                return { idx: condition(node) ? idx : -1, node: node };
            })
            .filter((d) => d.idx !== -1);
    }

    public swapNode(node: TreeNode | TreeNode[], idx: number) {
        if (node instanceof TreeNode) {
            // Insert single node
            this.tree[idx] = node;
        } else {
            // Insert multiple nodes
            const [begin, end] = this.searchSubtree(idx);
            this.tree.splice(begin, end - begin, ...node);
        }
        this.buildHierarchy();
    }

    private checkArity() {
        let arity = 1;
        for (let node of this.tree) {
            arity--;
            arity += node.type.arity;
        }
        console.log("Arity check:", arity);
        console.log(this.tree.map((n) => n.type.arity));
        console.log(this.toString());
    }

    copy(): Individual {
        return new Individual(
            this.tree.map((n) => n.copy()),
            this.baseContext,
            this.type.copy(),
            this.fitness.weights
        );
    }
}

export class TreeNode {
    /**
     * The type of the TreeNode
     */
    public readonly type: Type;
    /**
     * The context extension for all children nodes (except the first)
     */
    private readonly contextExtension?: ContextExtension;
    constructor(
        type: Type,
        private ncontext: [string, Context],
        contextExtension?: ContextExtension
    ) {
        this.type = type.copy();
        if (this.type instanceof MapFunctionType) {
            if (contextExtension) {
                this.contextExtension = contextExtension;
            } else {
                this.contextExtension = this.context.createExtension(this.type.extendContextType);
            }
        }
    }

    getContextExtension(argIndex: number) {
        if (argIndex > 0) return this.contextExtension;
        return undefined;
    }

    get context() {
        return this.ncontext[1];
    }

    format(...args: string[]) {
        return this.type.format(this.ncontext[0], this.contextExtension?.name, ...args);
    }

    copy() {
        return new TreeNode(this.type.copy(), this.ncontext, this.contextExtension);
    }
}

class Fitness {
    private pvalue: number[] = [];
    constructor(public readonly weights: number[]) {}

    set values(value: number[]) {
        if (value.length !== this.weights.length) {
            throw new Error("Fitness values and weights must have the same length");
        }
        this.pvalue = value;
    }

    get values() {
        return this.pvalue.map((v, i) => v * this.weights[i]);
    }

    get value() {
        return this.values.reduce((a, b) => a + b, 0);
    }

    public deleteValues() {
        this.pvalue = [];
    }

    get valid() {
        return this.pvalue.length === this.weights.length;
    }

    compare(other: Fitness) {
        if (this.values.length !== other.values.length) {
            throw new Error("Fitness values and weights must have the same length");
        }
        const tvalues = this.values;
        const ovalues = other.values;
        for (let i = 0; i < tvalues.length; i++) {
            if (tvalues[i] < ovalues[i]) return -1;
            if (tvalues[i] > ovalues[i]) return 1;
        }
        return 0;
    }
}
