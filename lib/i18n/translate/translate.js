/**
 * @typedef { {
 *   [id: string]: string;
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
 *   alert(translate('HELLO', 'Hello {name}', { name: 'world' }));
 * }
 * ```
 *
 * @param {string} id
 * @param {string} defaultTranslation
 * @param {TranslateReplacements} [replacements]
 *
 * @return {string}
 */
export default function translate(id, defaultTranslation, replacements = {}) {
  return defaultTranslation.replace(/{([^}]+)}/g, (_, key) => {
    return replacements[ key ] || `{${ key }}`;
  });
}