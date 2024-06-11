import { Context } from "./context";
import {
    PrimType,
    ObjType,
    CollType,
    UnionType,
    FunctionType,
    ParamType,
    MapFunctionType,
    Type,
} from "./type";
import * as gp from "./gp";
import { Individual, TreeNode } from "./tree";
import { random } from "./random";

//const stringT = new PrimType("String");
const intT = new PrimType("Int");
//const floatT = new PrimType("Float");
const booleanT = new PrimType("Boolean");

const personT = new ObjType("Person");
//personT.addProperty("name", stringT);
personT.addProperty("age", intT);
personT.addProperty("isStudent", booleanT);
personT.addProperty("parents", new CollType(personT));
//personT.addProperty("balance", new FunctionType(intT, []));

const binaryFnFormat = (name: string, ...args: string[]) => `(${args[0]} ${name} ${args[1]})`;
const arrowFnFormat = (name: string, ...args: string[]) =>
    `${args[0]}->${name}(${args.slice(1).join(" ,")})`;

const binaryIntOpT = new FunctionType(intT, [intT, intT], binaryFnFormat);
const binaryBoolOpT = new FunctionType(booleanT, [booleanT, booleanT], binaryFnFormat);

const compareableT = new UnionType([intT, booleanT]);
const compareParamT = new ParamType("T", compareableT);
const binaryCompareOpT = new FunctionType(booleanT, [compareParamT, compareParamT], binaryFnFormat);

const pickParamT = new ParamType("E");
const pickT = new FunctionType(pickParamT, [new CollType(pickParamT)], arrowFnFormat);

const forAllParamT = new ParamType("E");
const forAllT = new MapFunctionType(booleanT, new CollType(forAllParamT), [booleanT]);

const isEmptyT = new FunctionType(booleanT, [new CollType(new PrimType("Any"))], arrowFnFormat);

const binaryCompareIntOpT = new FunctionType(booleanT, [intT, intT], binaryFnFormat);

const context = new Context();

//Variables
context.add("self", personT);
//context.add("numberList", new CollType(intT));

// Terminals
context.add("true", booleanT);
context.add("false", booleanT);
context.add("0", intT);
context.add("1", intT);
//context.add("Bag {}", new CollType(new PrimType("Any")));

// Ocl functions
context.add("+", binaryIntOpT);
context.add("-", binaryIntOpT);
context.add("=", binaryCompareOpT);
context.add("<", binaryCompareIntOpT);
context.add(">", binaryCompareIntOpT);
context.add("<>", binaryCompareOpT);
context.add("and", binaryBoolOpT);
context.add("or", binaryBoolOpT);
context.add("implies", binaryBoolOpT);

//context.add("first", pickT);
//context.add("isEmpty", isEmptyT);
context.add("forAll", forAllT, 3);
//context.add("size", new FunctionType(intT, [new CollType(new PrimType("Any"))], arrowFnFormat));

const bpt = new ParamType("B");
const lele = new FunctionType(new CollType(bpt), [bpt]);
//context.add("Bag", lele);

const expr = (type: Type, context: Context) => gp.genGrow(context, type, 2, 2);

if (true) {
    const term = gp.genGrow(context, booleanT, 3, 5);
    let ind = new Individual(term, context, booleanT, [20, -1]);
    console.log(ind.toString());
    let copy = ind.copy();
    console.log(copy.toString());
    let inde = 0;
    console.log(copy.getNodeContext(inde));
    console.log(copy.getNode(inde));
} else {
    let term = gp.genFull(context, booleanT, 2, 5);
    const ind = new Individual(term, context, booleanT, [20, -1]);

    const t = new CollType(new ParamType("T"));
    const d = new ParamType("D");
    d.applyTo(new CollType(booleanT));
    t.applyTo(new CollType(d));
    console.log(t.toString());
    console.log(t.isCompatibleWith(lele));
}
