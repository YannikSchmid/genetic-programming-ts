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
            if (this.compare(el, e) <= 0) {
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

/**
 * A collector for collecting elements by keys.
 */
export class Collector<T, S> {
    private map: Map<T, S[]> = new Map();

    /**
     * Add a value to the collector.
     * @param key the key to add the value to
     * @param value the value to be added
     */
    public add(key: T, value: S) {
        if (this.map.has(key)) {
            this.map.get(key)!.push(value);
        } else {
            this.map.set(key, [value]);
        }
    }

    /**
     * Get all values for a key.
     * @param key the key to get the values for
     * @returns an array of values or undefined if the collector does not have any values for the given key
     */
    public get(key: T) {
        return this.map.get(key);
    }

    /**
     * Delete a key from the collector.
     * @param key the key to delete
     * @returns true if the collector had values for the key, false otherwise
     */
    public delete(key: T) {
        return this.map.delete(key);
    }

    /**
     * Check if the collector has any values for a key
     * @param key the key to check
     * @returns true if the collector has values for the key, false otherwise
     */
    public has(key: T) {
        return this.map.has(key);
    }

    /**
     * Get the keys of the collector which have values.
     * @returns an iterable of keys which have values
     */
    public keys() {
        return this.map.keys();
    }
}
