import {
  has,
  isNil,
  isObject
} from 'min-dash';

/**
 * Checks whether a value is an instance of Connection.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isConnection(value) {
  return isObject(value) && has(value, 'waypoints');
}

/**
 * Checks whether a value is an instance of Label.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isLabel(value) {
  return isObject(value) && has(value, 'labelTarget');
}

/**
 * Checks whether a value is an instance of Root.
 *
 * @param {any} value
 *
 * @return {boolean}
 */
export function isRoot(value) {
  return isObject(value) && isNil(value.parent);
}