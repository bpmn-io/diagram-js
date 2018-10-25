import { isArray } from 'min-dash';

/**
 * Returns true if event was triggered with any modifier
 * @param {KeyboardEvent} event
 */
export function hasModifier(event) {
  return (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);
}

/**
 * @param {KeyboardEvent} event
 */
export function isCmd(event) {

  // ensure we don't react to AltGr
  // (mapped to CTRL + ALT)
  if (event.altKey) {
    return false;
  }

  return event.ctrlKey || event.metaKey;
}

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

/**
 * @param {KeyboardEvent} event
 */
export function isShift(event) {
  return event.shiftKey;
}