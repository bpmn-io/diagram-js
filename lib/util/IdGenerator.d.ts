/**
 * Util that provides unique IDs.
 *
 *
 * The ids can be customized via a given prefix and contain a random value to avoid collisions.
 *
 */
export default class IdGenerator {
  /**
   * @param prefix a prefix to prepend to generated ids (for better readability)
   */
  constructor(prefix?: string);

  /**
   * Returns a next unique ID.
   *
   * @return the id
   */
  next(): string;
}
