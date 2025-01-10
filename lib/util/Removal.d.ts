/**
 * Remove from the beginning of a collection until it is empty.
 *
 * This is a null-safe operation that ensures elements
 * are being removed from the given collection until the
 * collection is empty.
 *
 * The implementation deals with the fact that a remove operation
 * may touch, i.e. remove multiple elements in the collection
 * at a time.
 *
 * @param removeFn
 *
 * @return the cleared collection
 */
export function saveClear(removeFn: (element: any) => void): any[];

/**
 * Remove from the beginning of a collection until it is empty.
 *
 * This is a null-safe operation that ensures elements
 * are being removed from the given collection until the
 * collection is empty.
 *
 * The implementation deals with the fact that a remove operation
 * may touch, i.e. remove multiple elements in the collection
 * at a time.
 *
 * @param collection
 * @param removeFn
 *
 * @return the cleared collection
 */
export function saveClear(collection: any[], removeFn: (element: any) => void): any[];
