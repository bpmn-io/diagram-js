import { Element } from '../../model/Types';

export type Outline = SVGSVGElement | SVGCircleElement | SVGRectElement;

/**
 * An interface to be implemented by an outline provider.
 */
export default interface OutlineProvider {

  /**
   * Returns outline shape for given element.
   *
   * @example
   *
   * ```javascript
   * getOutline(element) {
   *   if (element.type === 'Foo') {
   *     const outline = svgCreate('circle');
   *
   *     svgAttr(outline, {
   *       cx: element.width / 2,
   *       cy: element.height / 2,
   *       r: 23
   *     });
   *
   *     return outline;
   *   }
   * }
   * ```
   *
   * @param element
   */
  getOutline: (element: Element) => Outline;

  /**
   * Updates outline shape based on element's current size. Returns true if
   * update was handled by provider.
   *
   * @example
   *
   * ```javascript
   * updateOutline(element, outline) {
   *   if (element.type === 'Foo') {
   *     svgAttr(outline, {
   *       cx: element.width / 2,
   *       cy: element.height / 2,
   *       r: 23
   *    });
   *  } else if (element.type === 'Bar') {
   *    return true;
   *  }
   * 
   *  return false;
   * }
   * ```
   * 
   * @param element
   * @param outline
  */
  updateOutline: (element: Element, outline: Outline) => boolean;
}
