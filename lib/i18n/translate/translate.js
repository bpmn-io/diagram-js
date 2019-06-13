import { escapeHTML } from '../../util/EscapeUtil';


/**
 * A simple translation stub to be used for multi-language support
 * in diagrams. Can be easily replaced with a more sophisticated
 * solution. Escapes HTML per default.
 *
 * @example
 *
 * // use it inside any diagram component by injecting `translate`.
 *
 * function MyService(translate) {
 *   alert(translate('HELLO {you}', { you: 'You!' }));
 * }
 *
 * @param {String} template to interpolate
 * @param {Object} [replacements] a map with substitutes
 * @param {boolean} [safe] true if should not be escaped
 *
 * @return {String} the translated string
 */
export default function translate(template, replacements, safe) {

  if (typeof replacements === 'boolean') {
    safe = replacements;
    replacements = {};
  }

  replacements = replacements || {};

  template = template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] || '{' + key + '}';
  });

  return safe ? template : escapeHTML(template);
}