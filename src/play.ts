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

// Primitive types
export const intT = new PrimType("Integer");
export const booleanT = new PrimType("Boolean");

// Formats
const binaryFnFormat = (name: string, ...args: string[]) => `(${args[0]} ${name} ${args[1]})`;
const arrowFnFormat = (name: string, ...args: string[]) =>
    `${args[0]}->${name}(${args.slice(1).join(" ,")})`;

// Functions
const binaryIntOpT = new FunctionType(intT, [intT, intT], binaryFnFormat);
const binaryCompareIntOpT = new FunctionType(booleanT, [intT, intT], binaryFnFormat);

const compareParamT = new ParamType("T", new UnionType([intT, booleanT]));
const binaryCompareOpT = new FunctionType(booleanT, [compareParamT, compareParamT], binaryFnFormat);
const binaryBoolOpT = new FunctionType(booleanT, [booleanT, booleanT], binaryFnFormat);

const mapParamT = new ParamType("E");
const mapT = new MapFunctionType(booleanT, new CollType(mapParamT), [booleanT]);

const sizeT = new FunctionType(intT, [new CollType(new PrimType("Any"))], arrowFnFormat);

const includesParamT = new ParamType("I");
const includesT = new FunctionType(
    booleanT,
    [new CollType(includesParamT), includesParamT],
    arrowFnFormat
);

const context = new Context();
context.add("+", binaryIntOpT);
context.add("-", binaryIntOpT);
context.add("<", binaryCompareIntOpT);
context.add("<=", binaryCompareIntOpT);
context.add(">=", binaryCompareIntOpT);
context.add("=", binaryCompareIntOpT);
context.add(">", binaryCompareIntOpT);
context.add("<>", binaryCompareIntOpT);
context.add("and", binaryBoolOpT);
context.add("or", binaryBoolOpT);
context.add("implies", binaryBoolOpT);
context.add("forAll", mapT);
context.add("exists", mapT);
context.add("size", sizeT);
context.add("includes", includesT);

context.add("0", intT);
context.add("1", intT);
context.add("7", intT);
context.add("true", booleanT);
context.add("false", booleanT);

const test = new CollType(intT);

const f = includesT.copy();
console.log("Hey!");
console.log(f.toString());
f.inputTypes[0].applyTo(test);
console.log(f.toString());
