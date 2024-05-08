import { Context, ContextExtension } from "./context";
import { MapFunctionType, Type } from "./type";

export class Individual {
    private readonly tree: TreeNode[] = [];
    constructor(private baseContext: Context, tree?: TreeNode[]) {
        if (tree) this.tree = tree;
        let a = this.baseContext;
        a = a;
    }

    get size() {
        return this.tree.length;
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

    public getCompatibleSwaps(ind: Individual) {
        
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
    public readonly contextExtension?: ContextExtension;
    constructor(type: Type, private context: [string, Context]) {
        this.type = type.copy();
        if (this.type instanceof MapFunctionType) {
            this.contextExtension = this.context[1].createExtension(this.type.extendContextType);
        }
    }

    format(...args: string[]) {
        return this.type.format(this.context[0], this.contextExtension?.name, ...args);
    }
}
