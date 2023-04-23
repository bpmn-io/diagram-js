/**
 * Util that provides unique IDs.
 *
 * @class
 * @constructor
 *
 * The ids can be customized via a given prefix and contain a random value to avoid collisions.
 *
 * @param {string} [prefix] a prefix to prepend to generated ids (for better readability)
 */
export default function IdGenerator(prefix) {

  this._counter = 0;
  this._prefix = (prefix ? prefix + '-' : '') + Math.floor(Math.random() * 1000000000) + '-';
}

/**
 * Returns a next unique ID.
 *
 * @return {string} the id
 */
IdGenerator.prototype.next = function() {
  return this._prefix + (++this._counter);
};
