import {
  assign
} from 'min-dash';

/**
 * Create a fake key event for testing purposes.
 *
 * @param {String} key the key or code
 * @param {Object} [attrs]
 * @param {string} [attrs.type]
 *
 * @return {Event}
 */
export function createKeyEvent(key, attrs) {
  if (!attrs) {
    attrs = {};
  }

  var event = new Event(attrs.type || 'keydown', { bubbles: true, cancelable: true });
  var keyAttrs = { key: key, code: key };
  delete attrs.type;

  return assign(event, keyAttrs, attrs);
}