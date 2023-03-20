/**
 * @typedef { {
 *   [key: string]: string;
 * } } TranslateReplacements
 */

/**
 * A simple translation stub to be used for multi-language support
 * in diagrams. Can be easily replaced with a more sophisticated
 * solution.
 *
 * @example
 *
 * ```javascript
 * // use it inside any diagram component by injecting `translate`.
 *
 * function MyService(translate) {
 *   alert(translate('HELLO {you}', { you: 'You!' }));
 * }
 * ```
 *
 * @param {string} template to interpolate
 * @param {TranslateReplacements} [replacements] a map with substitutes
 *
 * @return {string} the translated string
 */
export default function translate(template, replacements) {

  replacements = replacements || {};

  return template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] || '{' + key + '}';
  });
}