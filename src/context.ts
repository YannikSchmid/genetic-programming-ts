import { Type } from "./type";
import * as random from "./random";

export class Context {
    public context = new Map<string, [importance: number, type: Type]>();

    add(name: string, type: Type, importance = 1) {
        if (this.context.has(name)) {
            throw new Error(`Name "${name}" already exists in context`);
        }
        this.context.set(name, [importance, type]);
    }

    createExtension(type: Type): ContextExtension {
        const name = this.generateContextName();
        return new ContextExtension(name, type);
    }

    isCompatible(context: Context) {
        for (let name of this.context.keys()) {
            if (!context.context.has(name)) return false;
        }
        for (let name of context.context.keys()) {
            if (!this.context.has(name)) return false;
        }
        return true;
    }

    getPrimitives(arity: (arg: number) => boolean, type?: Type, inputTypes?: Type[]) {
        //console.log("getPrimitives");
        //console.log(this.toString());
        //console.log("given", type?.toString());
        const result = [...this.context.entries()]
            .flatMap(([name, [importance, type]]) =>
                type.getImidiateTypes([2, 2]).map(([n, t]) => {
                    if (n === null) {
                        return [[name, t], importance] as [[string, Type], number];
                    } else {
                        return [[name + "." + n, t], importance] as [[string, Type], number];
                    }
                })
            )
            .filter(
                ([[_name, t], _]) =>
                    arity(t.arity) &&
                    (type ? type.isCompatibleWith(t) : true) &&
                    (inputTypes
                        ? inputTypes.every((it, i) => it.isCompatibleWith(t.inputTypes[i]))
                        : true)
            );
        //console.log(
        //    "found",
        //    result.map(([name, type]) => `${name}: ${type.toString()}`)
        //);
        return result;
    }

    toString() {
        return (
            "Context: " +
            [...this.context.entries()]
                .flatMap(([name, [importance, type]]) =>
                    type.getImidiateTypes().map(([n, t]) => {
                        if (n === null) {
                            return [name, t] as [string, Type];
                        } else {
                            return [name + "." + n, t] as [string, Type];
                        }
                    })
                )
                .map(([name, type]) => `${name}: ${type.toString()}`)
                .join("; ")
        );
    }

    extend(extension?: ContextExtension, importance = 1) {
        if (!extension) return this;
        const newContext = new Context();
        newContext.context = new Map([
            ...this.context.entries(),
            [extension.name, [importance, extension.type]],
        ]);
        return newContext;
    }

    private generateContextName(): string {
        const characters = "abcdefghijklmnopqrstuvwxyz";
        let name = "";
        const reserved = ["let", "for", "xor"];
        while (name === "" || this.context.has(name) || reserved.includes(name)) {
            for (let i = 0; i < 3; i++) {
                const randomIndex = random.randInt(0, characters.length - 1);
                name += characters.charAt(randomIndex);
            }
        }
        return name;
    }

    public includes(name: string) {
        return this.context.has(name);
    }
}

export class ContextExtension {
    constructor(public readonly name: string, public readonly type: Type) {}
}
