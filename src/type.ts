import { random } from "./random";

export abstract class Type {
    /**
     * The arity of the type. This is the number of input arguments the type takes if it is called.
     */
    abstract readonly arity: number;
    /**
     * The types of the arguments the type takes if it is called.
     */
    abstract readonly inputTypes: Type[];
    /**
     * Returns wether the given type is compatible with this type. This is not commutative.
     * @param type
     */
    isCompatibleWith(type: Type): boolean {
        if (type instanceof FunctionType) {
            return this.isCompatibleWith(type.returnType);
        }
        if (type instanceof ParamType) {
            if (type.actualType) return this.isCompatibleWith(type.actualType);
            if (type.extending) return this.isCompatibleWith(type.extending);
            return true;
        }
        return this._isCompatibleWith(type);
    }
    abstract _isCompatibleWith(type: Type): boolean;
    abstract getImidiateTypes(prop?: [number, number]): [string | null, Type][];
    abstract toString(): string;
    /**
     * Returns a formatted string of the type with the given name and arguments.
     * @param name
     * @param args
     */
    abstract format(name: string, contextExtension: string | undefined, ...args: string[]): string;
    /**
     * Returns a deep copy of the type, or itself if it is an immutable type (like PrimType).
     * @param recursion A list of pairs of types that have been copied. This is used to avoid infinite recursion. Do not set this parameter unless you know what you are doing.
     */
    copy() {
        return this._copy([])[0];
    }
    abstract _copy(cache: [Type, Type][]): [Type, [Type, Type][]];
    abstract applyTo(type: Type): void;
}

type Prims = string;

export class PrimType extends Type {
    readonly arity = 0;
    readonly inputTypes = [];
    private readonly type: Prims;
    constructor(type: Prims) {
        super();
        this.type = type;
    }
    _isCompatibleWith(type: Type): boolean {
        if (this.type === "Any") return true;
        if (type instanceof PrimType) {
            return this.type === type.type;
        }
        return false;
    }
    getImidiateTypes(): [null, Type][] {
        return [[null, this]];
    }
    toString() {
        return this.type;
    }
    format(name: string, contextExtension: string | undefined, ...args: string[]) {
        return name;
    }
    _copy(cache: [Type, Type][]): [Type, [Type, Type][]] {
        return [this, cache];
    }
    applyTo(type: Type): void {
        if (type instanceof ParamType) {
            type.set(this);
        }
    }
}

export class ObjType extends Type {
    readonly arity = 0;
    readonly inputTypes: Type[] = [];
    public readonly properties = new Map<string, Type>();
    constructor(private name: string = "Object") {
        super();
    }
    addProperty(name: string, type: Type) {
        this.properties.set(name, type);
    }
    _isCompatibleWith(type: Type): boolean {
        if (type === this) return true;
        if (type instanceof ObjType) {
            for (const [pname, ptype] of this.properties.entries()) {
                if (
                    !type.properties.has(pname) ||
                    !this.properties.get(pname)!.isCompatibleWith(ptype)
                ) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    getImidiateTypes(prop: [number, number] = [2, 2]): [string | null, Type][] {
        if (prop) {
            if (random() > prop[0]) return [];
            prop[0] = prop[0] / prop[1];
        }
        const result: [string | null, Type][] = [...this.properties.entries()].flatMap(
            ([name, type]) => {
                return type.getImidiateTypes(prop).map(([n, t]) => {
                    if (n === null) return [name, t] as [string, Type];
                    return [name + "." + n, t] as [string, Type];
                });
            }
        );
        result.push([null, this]);
        return result;
    }
    toString() {
        return this.name;
    }
    format(name: string, contextExtension: string | undefined, ...args: string[]) {
        return name;
    }
    _copy(cache: [Type, Type][]): [Type, [Type, Type][]] {
        for (const [t1, t2] of cache || []) {
            if (t1 === this) return [t2, cache];
        }
        const obj = new ObjType(this.name);
        cache.push([this, obj]);
        for (const [pname, ptype] of this.properties.entries()) {
            let ctype: Type;
            [ctype, cache] = ptype._copy(cache);
            obj.addProperty(pname, ctype);
        }
        return [obj, cache];
    }
    applyTo(type: Type): void {
        if (type instanceof ParamType) {
            type.set(this);
        }
    }
}

export class ParamType extends Type {
    arity = 0;
    readonly inputTypes: Type[] = [];
    actualType: Type | null = null;
    constructor(private readonly name: string, public readonly extending?: Type) {
        super();
    }
    _isCompatibleWith(type: Type): boolean {
        if (this.actualType) return this.actualType.isCompatibleWith(type);
        if (this.extending) return this.extending.isCompatibleWith(type);
        return true;
    }
    getImidiateTypes(prop: [number, number] = [2, 2]): [null | string, Type][] {
        if (this.actualType) {
            if (!(this.actualType instanceof ObjType)) return [[null, this.actualType]];
            return this.actualType.getImidiateTypes(prop);
        }
        return [[null, this]];
    }
    toString() {
        if (this.actualType) return this.name + ": " + this.actualType.toString();
        if (this.extending) return this.name + " extends " + this.extending.toString();
        return this.name;
    }
    format(name: string, contextExtension: string | undefined, ...args: string[]) {
        if (this.actualType) return this.actualType.format(name, contextExtension, ...args);
        return name;
    }
    _copy(cache: [Type, Type][]): [Type, [Type, Type][]] {
        for (const [t1, t2] of cache || []) {
            if (t1 === this) return [t2, cache];
        }
        const newParam = new ParamType(this.name, this.extending);
        cache.push([this, newParam]);
        return [newParam, cache];
    }
    applyTo(type: Type): void {
        this.set(type);
    }
    set(type: Type) {
        if (type instanceof FunctionType) type = type.returnType;
        //console.log("set", this.name, "to", type.toString());
        this.actualType = type;
    }
}

export class UnionType extends Type {
    arity: number = 0;
    readonly inputTypes: Type[] = [];
    constructor(private readonly types: Type[]) {
        super();
    }
    _isCompatibleWith(type: Type): boolean {
        if (type instanceof UnionType) {
            return this.types.every((t) => type.types.some((t2) => t.isCompatibleWith(t2)));
        }
        return this.types.some((t) => t.isCompatibleWith(type));
    }
    getImidiateTypes(): [null, Type][] {
        return [[null, this]];
    }
    toString() {
        return "(" + this.types.map((t) => t.toString()).join(" | ") + ")";
    }
    format(name: string, contextExtension: string | undefined, ...args: string[]): string {
        return name;
    }
    _copy(cache: [Type, Type][]): [Type, [Type, Type][]] {
        for (const [t1, t2] of cache || []) {
            if (t1 === this) return [t2, cache];
        }
        const types: Type[] = [];
        this.types.forEach((t) => {
            let ctype: Type;
            [ctype, cache] = t._copy(cache);
            types.push(ctype);
        });
        const union = new UnionType(types);
        cache.push([this, union]);
        return [union, cache];
    }
    applyTo(type: Type): void {
        if (type instanceof ParamType) {
            type.set(this);
        }
    }
}

export class CollType extends Type {
    arity: number = 0;
    readonly inputTypes: Type[] = [];
    constructor(public readonly elementType: Type) {
        super();
    }
    _isCompatibleWith(type: Type): boolean {
        if (type instanceof CollType) {
            return this.elementType.isCompatibleWith(type.elementType);
        }
        return false;
    }
    getImidiateTypes(): [string | null, Type][] {
        return [[null, this]];
    }
    toString() {
        return this.elementType.toString() + "[]";
    }
    format(name: string, contextExtension: string | undefined, ...args: string[]) {
        return name;
    }
    _copy(cache: [Type, Type][]): [Type, [Type, Type][]] {
        for (const [t1, t2] of cache || []) {
            if (t1 === this) return [t2, cache];
        }
        let ctype: Type;
        [ctype, cache] = this.elementType._copy(cache);
        const coll = new CollType(ctype);
        cache.push([this, coll]);
        return [coll, cache];
    }
    applyTo(type: Type): void {
        if (type instanceof ParamType) {
            type.set(this);
        } else if (type instanceof CollType) {
            this.elementType.applyTo(type.elementType);
        }
    }
}

export class FunctionType extends Type {
    arity: number;
    readonly returnType: Type;
    readonly inputTypes: Type[];
    constructor(
        returnType: Type,
        inputTypes: Type[],
        protected formatFn?: (name: string, ...args: string[]) => string
    ) {
        super();
        this.returnType = returnType;
        this.inputTypes = inputTypes;
        this.arity = inputTypes.length;
    }
    _isCompatibleWith(type: Type): boolean {
        if (type instanceof FunctionType)
            return (
                this.inputTypes.length === type.inputTypes.length &&
                this.returnType.isCompatibleWith(type.returnType) &&
                this.inputTypes.every((t, i) => type.inputTypes[i].isCompatibleWith(t))
            );
        return false;
    }
    getImidiateTypes(): [string | null, Type][] {
        return [[null, this]];
    }
    toString(): string {
        return (
            "(" +
            this.inputTypes.map((t) => t.toString()).join(", ") +
            ") => " +
            this.returnType.toString()
        );
    }
    format(name: string, contextExtension: string | undefined, ...args: string[]): string {
        if (this.formatFn) return this.formatFn(name, ...args);
        return name + "(" + args.join(", ") + ")";
    }
    _copy(cache: [Type, Type][]): [Type, [Type, Type][]] {
        for (const [t1, t2] of cache || []) {
            if (t1 === this) return [t2, cache];
        }
        let rtype: Type;
        [rtype, cache] = this.returnType._copy(cache);
        const itypes: Type[] = [];
        this.inputTypes.forEach((t) => {
            let ctype: Type;
            [ctype, cache] = t._copy(cache);
            itypes.push(ctype);
        });
        const func = new FunctionType(rtype, itypes, this.formatFn);
        cache.push([this, func]);
        return [func, cache];
    }
    applyTo(type: Type): void {
        if (type instanceof ParamType) {
            type.set(this);
        } else if (type instanceof FunctionType) {
            this.returnType.applyTo(type.returnType);
            this.inputTypes.forEach((t, i) => {
                t.applyTo(type.inputTypes[i]);
            });
        } else {
            this.returnType.applyTo(type);
        }
    }
}

export class MapFunctionType extends FunctionType {
    constructor(returnType: Type, private readonly collType: CollType, inputTypes: Type[]) {
        super(returnType, [collType, ...inputTypes]);
    }
    get extendContextType() {
        return this.collType.elementType;
    }
    _copy(cache: [Type, Type][]): [Type, [Type, Type][]] {
        for (const [t1, t2] of cache || []) {
            if (t1 === this) return [t2, cache];
        }
        let rtype: Type;
        [rtype, cache] = this.returnType._copy(cache);
        let ctype: Type;
        [ctype, cache] = this.collType._copy(cache);
        const itypes: Type[] = [];
        this.inputTypes.slice(1).forEach((t) => {
            let citype: Type;
            [citype, cache] = t._copy(cache);
            itypes.push(citype);
        });
        const func = new MapFunctionType(rtype, ctype as CollType, itypes);
        cache.push([this, func]);
        return [func, cache];
    }
    format(name: string, contextExtension: string | undefined, ...args: string[]): string {
        return (
            args[0] + "->" + name + "(" + contextExtension + " | " + args.slice(1).join(", ") + ")"
        );
    }
    applyTo(type: Type): void {
        if (type instanceof ParamType) {
            type.set(this);
        } else if (type instanceof MapFunctionType) {
            this.returnType.applyTo(type.returnType);
            this.collType.applyTo(type.collType);
            this.inputTypes.forEach((t, i) => {
                t.applyTo(type.inputTypes[i]);
            });
        }
    }
}
