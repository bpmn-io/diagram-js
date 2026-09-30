import { isArray } from 'min-dash';

export var KEYS_COPY = [ 'c', 'C' ];
export var KEYS_PASTE = [ 'v', 'V' ];
export var KEYS_DUPLICATE = [ 'd', 'D' ];
export var KEYS_CUT = [ 'x', 'X' ];
export var KEYS_REDO = [ 'y', 'Y' ];
export var KEYS_UNDO = [ 'z', 'Z' ];

/**
 * Returns true if event was triggered with any modifier
 * @param {KeyboardEvent} event
 */
export function hasModifier(event) {
  return (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);
}

/**
 * @param {KeyboardEvent} event
 * @return {boolean}
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
 * Keys are matched against the logical key (`KeyboardEvent#key`) first,
 * respecting Latin keyboard layouts such as QWERTZ or AZERTY.
 *
 * If a non-Latin layout (e.g. Cyrillic, Arabic) is active, letter keys
 * are matched by their physical location (`KeyboardEvent#code`), assuming
 * a US (QWERTY) layout. This applies to shortcuts with and without modifiers.
 *
 * @param {string|string[]} keys
 * @param {KeyboardEvent} event
 * @return {boolean}
 */
export function isKey(keys, event) {
  keys = isArray(keys) ? keys : [ keys ];

  return (
    keys.indexOf(event.key) !== -1 ||
    keys.indexOf(event.code) !== -1 ||
    keys.indexOf(getPhysicalLetter(event)) !== -1
  );
}

// letters of a specific, non-Latin script; excludes letters shared with Latin
// orthographies, e.g. U+02BC (ʼ) or U+02BB (ʻ)
var NON_LATIN_LETTER = /^(?!\p{Script_Extensions=Latin}|\p{Script=Common})\p{Letter}$/u;

var NON_LETTER = /^\P{Letter}$/u;

/**
 * Returns the (US layout) letter of the physical key pressed,
 * if the logical key is a non-Latin letter.
 *
 * With <Shift>, some non-Latin layouts (e.g. Arabic) produce symbols on letter
 * keys. As a symbol does not reveal the layout, we additionally require the
 * legacy `KeyboardEvent#keyCode` to agree: the operating system maps it to the
 * US letter on non-Latin layouts only, but not on Latin ones (e.g. Dvorak).
 *
 * @param {KeyboardEvent} event
 *
 * @return {string|null}
 */
function getPhysicalLetter(event) {
  var key = event.key,
      match = /^Key([A-Z])$/.exec(event.code || '');

  if (!match || typeof key !== 'string') {
    return null;
  }

  var letter = match[1];

  if (NON_LATIN_LETTER.test(key)) {
    return event.shiftKey ? letter : letter.toLowerCase();
  }

  if (event.shiftKey && NON_LETTER.test(key) && event.keyCode === letter.charCodeAt(0)) {
    return letter;
  }

  return null;
}

/**
 * @param {KeyboardEvent} event
 */
export function isShift(event) {
  return event.shiftKey;
}

/**
 * @param {KeyboardEvent} event
 */
export function isCopy(event) {
  return isCmd(event) && isKey(KEYS_COPY, event);
}

/**
 * @param {KeyboardEvent} event
 */
export function isPaste(event) {
  return isCmd(event) && isKey(KEYS_PASTE, event);
}

/**
 * @param {KeyboardEvent} event
 */
export function isDuplicate(event) {
  return isCmd(event) && isKey(KEYS_DUPLICATE, event);
}

/**
 * @param {KeyboardEvent} event
 */
export function isCut(event) {
  return isCmd(event) && isKey(KEYS_CUT, event);
}

/**
 * @param {KeyboardEvent} event
 */
export function isUndo(event) {
  return isCmd(event) && !isShift(event) && isKey(KEYS_UNDO, event);
}

/**
 * @param {KeyboardEvent} event
 */
export function isRedo(event) {
  return isCmd(event) && (
    isKey(KEYS_REDO, event) || (
      isKey(KEYS_UNDO, event) && isShift(event)
    )
  );
}
