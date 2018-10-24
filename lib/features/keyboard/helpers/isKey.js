import { isArray } from 'min-dash';

/**
 * Checks if key pressed is one of provided keys.
 *
 * @param {String|String[]} keys
 * @param {KeyboardEvent} event
 */
export function isKey(keys, event) {
  keys = isArray(keys) ? keys : [ keys ];

  return keys.indexOf(event.key) > -1;
}