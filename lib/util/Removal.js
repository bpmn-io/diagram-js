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
 * @param {Object[]} [collection]
 * @param {(element: Object) => void} removeFn
 *
 * @return {Object[]} the cleared collection
 */
export function saveClear(collection, removeFn) {

  if (typeof removeFn !== 'function') {
    throw new Error('removeFn iterator must be a function');
  }

  if (!collection) {
    return;
  }

  var e;

  while ((e = collection[0])) {
    removeFn(e);
  }

  return collection;
}
