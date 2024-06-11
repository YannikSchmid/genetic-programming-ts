import { Individual } from "./tree";
import { table, getBorderCharacters } from "table";

export class HallOfFame implements Iterable<Individual> {
    private content = new SortedList<Individual>((a, b) => a.fitness.compare(b.fitness));
    private seen = new Set<string>();

    constructor(public max_size: number) {}

    update(population: Individual[]) {
        if (this.max_size <= 0) return;
        for (let ind of population) {
            let str = ind.toString();
            if (this.seen.has(str)) continue;
            this.seen.add(str);

            if (
                this.content.length < this.max_size ||
                (this.content.getLast() !== undefined &&
                    ind.fitness.compare(this.content.getLast()!.fitness) > 0)
            ) {
                if (this.content.length >= this.max_size) this.content.pop();
                this.content.insert(ind);
            }
        }
    }

    public getList() {
        return [...this.content].map((ind) => {
            return { str: ind.toString(), fitness: ind.fitness.values };
        });
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
                ind.fitness.values.map((v) => v.toPrecision(3)).toString() || "",
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

    get(index: number) {
        return this.content.get(index);
    }
}

export class SortedList<T> implements Iterable<T> {
    /**
     * The list content.
     */
    private content: T[] = [];

    /**
     * @param compare the comparison function to use for sorting. Takes two elements and is expected to return a negative number if the first element is smaller,
     * a positive number if the first element is larger and 0 if they are equal.
     */
    constructor(private compare: (a: T, b: T) => number) {}

    /**
     * The length of the list.
     * @readonly
     */
    get length() {
        return this.content.length;
    }

    [Symbol.iterator]() {
        return this.content[Symbol.iterator]();
    }

    /**
     * Get an element from the list.
     * @param index the index of the element to get
     * @returns the element at the given index or `undefined` if the index is out of bounds
     */
    get(index: number) {
        if (index < 0 || index >= this.content.length) return undefined;
        return this.content[index];
    }

    /**
     * Get the first element from the list.
     * @returns the first element or `undefined` if the list is empty
     */
    getFirst() {
        if (this.content.length === 0) return undefined;
        return this.content[0];
    }

    /**
     * Get the last element from the list.
     * @returns the last element or `undefined` if the list is empty
     */
    getLast() {
        if (this.content.length === 0) return undefined;
        return this.content[this.content.length - 1];
    }

    /**
     * Removes the last element from the list and returns it.
     * @returns the last element or `undefined` if the list is empty
     */
    pop() {
        return this.content.pop();
    }

    /**
     * Insert an element into the list. The element is inserted at the correct position to maintain the sorted state.
     * @param el
     */
    insert(el: T) {
        for (let [i, e] of this.content.entries()) {
            if (this.compare(e, el) <= 0) {
                this.content.splice(i, 0, el);
                return;
            }
        }
        this.content.push(el);
    }

    /**
     * Remove an element from the list.
     * @param index the index of the element to remove
     */
    remove(index: number) {
        this.content.splice(index, 1);
    }

    /**
     * Clear the list.
     */
    clear() {
        this.content = [];
    }

    /**
     * Returns a string representation of the list.
     */
    toString() {
        return this.content.toString();
    }
}
