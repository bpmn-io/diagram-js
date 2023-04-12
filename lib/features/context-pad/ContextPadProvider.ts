import { Element } from '../../model/Types';

import { ContextPadTarget } from './ContextPad';

export type ContextPadEntry<ElementType extends Element = Element> = {
  action: (event: Event, target: ContextPadTarget<ElementType>, autoActivate: boolean) => void;
  className?: string;
  group?: string;
  html?: string;
  imageUrl?: string;
  title?: string;
};

export type ContextPadEntries<ElementType extends Element = Element> = Record<string, ContextPadEntry<ElementType>>;

export type ContextPadEntriesCallback<ElementType extends Element = Element> = (entries: ContextPadEntries<ElementType>) => ContextPadEntries<ElementType>;

/**
 * An interface to be implemented by a context menu provider.
 */
export default interface ContextPadProvider<ElementType extends Element = Element> {

  /**
   * Returns a map of entries or a function that receives, modifies and returns
   * a map of entries for one element.
   *
   * The following example shows how to replace any entries returned by previous
   * providers with one entry which alerts the ID of the given element when
   * clicking on the entry.
   *
   * @example
   *
   * ```javascript
   * getPopupMenuEntries(element) {
   *   return function(entries) {
   *     return {
   *       alert: {
   *         action: (event, target, autoActivate) => {
   *           alert(element.id);
   *         },
   *         className: 'alert',
   *         title: 'Alert element ID'
   *       }
   *     };
   *   };
   * }
   * ```
   *
   * @param element
   */
  getContextPadEntries?: (element: ElementType) => ContextPadEntriesCallback<ElementType> | ContextPadEntries<ElementType>;

  /**
   * Returns a map of entries or a function that receives, modifies and returns
   * a map of entries for many elements.
   *
   * The following example shows how to replace any entries returned by previous
   * providers with one entry which alerts the IDs of the given elements when
   * clicking on the entry.
   *
   * @example
   *
   * ```javascript
   * getMultiElementContextPadEntries(elements) {
   *   return function(entries) {
   *     return {
   *       alert: {
   *         action: (event, target, autoActivate) => {
   *           elements.forEach(element => alert(element.id));
   *         },
   *         className: 'alert',
   *         title: 'Alert element IDs'
   *       }
   *     };
   * }
   * ```
   *
   * @param elements
   */
  getMultiElementContextPadEntries?: (elements: ElementType[]) => ContextPadEntriesCallback<ElementType> | ContextPadEntries<ElementType>;
}