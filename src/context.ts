import { Type } from "./type";
import * as random from "./random";

export class Context {
    private context = new Map<string, [importance: number, type: Type]>();

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

    getPrimitives(terminal: boolean, type?: Type) {
        //console.log("getPrimitives");
        //console.log(this.toString());
        //console.log("given", type?.toString());
        const result = [...this.context.entries()]
            .flatMap(([name, [importance, type]]) =>
                type.getImidiateTypes().map(([n, t]) => {
                    if (n === null) {
                        return [[name, t], importance] as [[string, Type], number];
                    } else {
                        return [[name + "." + n, t], importance] as [[string, Type], number];
                    }
                })
            )
            .filter(
                ([[_name, t], _]) =>
                    (terminal ? t.arity === 0 : t.arity > 0) &&
                    (type ? type.isCompatibleWith(t) : true)
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

    extend(extension?: ContextExtension, importance = 10) {
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
        while (name === "" || this.context.has(name)) {
            for (let i = 0; i < 3; i++) {
                const randomIndex = random.randInt(0, characters.length - 1);
                name += characters.charAt(randomIndex);
            }
        }
        return name;
    }
}

export class ContextExtension {
    constructor(public readonly name: string, public readonly type: Type) {}
}
