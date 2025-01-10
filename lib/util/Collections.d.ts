/**
 * Failsafe remove an element from a collection
 *
 * @param collection
 * @param element
 *
 * @return the previous index of the element
 */
export function remove(collection?: Array<any>, element?: any): number;
/**
 * Fail save add an element to the given connection, ensuring
 * it does not yet exist.
 *
 * @param collection
 * @param element
 * @param idx
 */
export function add(collection: Array<any>, element: any, idx?: number): void;
/**
 * Fail save get the index of an element in a collection.
 *
 * @param collection
 * @param element
 *
 * @return the index or -1 if collection or element do
 *                  not exist or the element is not contained.
 */
export function indexOf(collection: Array<any>, element: any): number;
