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
 * @param template to interpolate
 * @param replacements a map with substitutes
 *
 * @return the translated string
 */
export default function translate(template: string, replacements?: TranslateReplacements): string;
export type TranslateReplacements = {
    [key: string]: string;
};
