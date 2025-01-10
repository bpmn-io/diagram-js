/**
 * A registry that keeps track of all shapes in the diagram.
 *
 *
 */
export default class ElementRegistry {
  static $inject: string[];

  /**
   * @param eventBus
   */
  constructor(eventBus: EventBus);

  /**
   * Add an element and its graphical representation(s) to the registry.
   *
   * @param element The element to be added.
   * @param gfx The primary graphical representation.
   * @param secondaryGfx The secondary graphical representation.
   */
  add(element: ElementLike, gfx: SVGElement, secondaryGfx?: SVGElement): void;

  /**
   * Remove an element from the registry.
   *
   * @param element
   */
  remove(element: ElementLike | string): void;

  /**
   * Update an elements ID.
   *
   * @param element The element or its ID.
   * @param newId The new ID.
   */
  updateId(element: ElementLike | string, newId: string): void;

  /**
   * Update the graphical representation of an element.
   *
   * @param filter The element or its ID.
   * @param gfx The new graphical representation.
   * @param secondary Whether to update the secondary graphical representation.
   */
  updateGraphics(filter: ElementLike | string, gfx: SVGElement, secondary?: boolean): SVGElement;

  /**
   * Get the element with the given ID or graphical representation.
   *
   * @example
   *
   * ```javascript
   * elementRegistry.get('SomeElementId_1');
   *
   * elementRegistry.get(gfx);
   * ```
   *
   * @param filter The elements ID or graphical representation.
   *
   * @return The element.
   */
  get(filter: string | SVGElement): ElementLike | undefined;

  /**
   * Return all elements that match a given filter function.
   *
   * @param fn The filter function.
   *
   * @return The matching elements.
   */
  filter(fn: ElementRegistryFilterCallback): ElementLike[];

  /**
   * Return the first element that matches the given filter function.
   *
   * @param fn The filter function.
   *
   * @return The matching element.
   */
  find(fn: ElementRegistryFilterCallback): ElementLike | undefined;

  /**
   * Get all elements.
   *
   * @return All elements.
   */
  getAll(): ElementLike[];

  /**
   * Execute a given function for each element.
   *
   * @param fn The function to execute.
   */
  forEach(fn: ElementRegistryForEachCallback): void;

  /**
   * Return the graphical representation of an element.
   *
   * @example
   *
   * ```javascript
   * elementRegistry.getGraphics('SomeElementId_1');
   *
   * elementRegistry.getGraphics(rootElement); // <g ...>
   *
   * elementRegistry.getGraphics(rootElement, true); // <svg ...>
   * ```
   *
   * @param filter The element or its ID.
   * @param secondary Whether to return the secondary graphical representation.
   *
   * @return The graphical representation.
   */
  getGraphics(filter: ElementLike | string, secondary?: boolean): SVGElement;
}

type ElementLike = import('./Types').ElementLike;
type EventBus = import('./EventBus').default;
export type ElementRegistryFilterCallback = (element: ElementLike, gfx: SVGElement) => boolean | any;
export type ElementRegistryForEachCallback = (element: ElementLike, gfx: SVGElement) => any;
