export declare class SortedList<T> implements Iterable<T> {
    private compare;
    /**
     * The list content.
     */
    private content;
    /**
     * @param compare the comparison function to use for sorting. Takes two elements and is expected to return a negative number if the first element is smaller,
     * a positive number if the first element is larger and 0 if they are equal.
     */
    constructor(compare: (a: T, b: T) => number);
    /**
     * The length of the list.
     * @readonly
     */
    get length(): number;
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * Get an element from the list.
     * @param index the index of the element to get
     * @returns the element at the given index or `undefined` if the index is out of bounds
     */
    get(index: number): T | undefined;
    /**
     * Get the first element from the list.
     * @returns the first element or `undefined` if the list is empty
     */
    getFirst(): T | undefined;
    /**
     * Get the last element from the list.
     * @returns the last element or `undefined` if the list is empty
     */
    getLast(): T | undefined;
    /**
     * Removes the last element from the list and returns it.
     * @returns the last element or `undefined` if the list is empty
     */
    pop(): T | undefined;
    /**
     * Insert an element into the list. The element is inserted at the correct position to maintain the sorted state.
     * @param el
     */
    insert(el: T): void;
    /**
     * Remove an element from the list.
     * @param index the index of the element to remove
     */
    remove(index: number): void;
    /**
     * Clear the list.
     */
    clear(): void;
    /**
     * Returns a string representation of the list.
     */
    toString(): string;
}
/**
 * A collector for collecting elements by keys.
 */
export declare class Collector<T, S> {
    private map;
    /**
     * Add a value to the collector.
     * @param key the key to add the value to
     * @param value the value to be added
     */
    add(key: T, value: S): void;
    /**
     * Get all values for a key.
     * @param key the key to get the values for
     * @returns an array of values or undefined if the collector does not have any values for the given key
     */
    get(key: T): S[] | undefined;
    /**
     * Delete a key from the collector.
     * @param key the key to delete
     * @returns true if the collector had values for the key, false otherwise
     */
    delete(key: T): boolean;
    /**
     * Check if the collector has any values for a key
     * @param key the key to check
     * @returns true if the collector has values for the key, false otherwise
     */
    has(key: T): boolean;
    /**
     * Get the keys of the collector which have values.
     * @returns an iterable of keys which have values
     */
    keys(): IterableIterator<T>;
}
