import { isArray } from 'min-dash';

var KEYCODE_C = 67;
var KEYCODE_V = 86;
var KEYCODE_Y = 89;
var KEYCODE_Z = 90;

var KEYS_COPY = [ 'c', 'C', KEYCODE_C ];
var KEYS_PASTE = [ 'v', 'V', KEYCODE_V ];
var KEYS_REDO = [ 'y', 'Y', KEYCODE_Y ];
var KEYS_UNDO = [ 'z', 'Z', KEYCODE_Z ];

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
 * @param {string|Array<string>} keys
 * @param {KeyboardEvent} event
 */
export function isKey(keys, event) {
  keys = isArray(keys) ? keys : [ keys ];

  return keys.indexOf(event.key) !== -1 || keys.indexOf(event.keyCode) !== -1;
}

/**
 * @param {KeyboardEvent} event
 */
export function isShift(event) {
  return event.shiftKey;
}

export function isCopy(event) {
  return isCmd(event) && isKey(KEYS_COPY, event);
}

export function isPaste(event) {
  return isCmd(event) && isKey(KEYS_PASTE, event);
}

export function isUndo(event) {
  return isCmd(event) && !isShift(event) && isKey(KEYS_UNDO, event);
}

export function isRedo(event) {
  return isCmd(event) && (
    isKey(KEYS_REDO, event) || (
      isKey(KEYS_UNDO, event) && isShift(event)
    )
  );
}