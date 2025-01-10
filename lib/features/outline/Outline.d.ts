/**
 *
 * A plugin that adds an outline to shapes and connections that may be activated and styled
 * via CSS classes.
 *
 */
export default class Outline {
  static $inject: string[];

  /**
   * @param eventBus
   * @param styles
   */
  constructor(eventBus: EventBus, styles: Styles);

  offset: number;

  /**
   * Updates the outline of a shape respecting the dimension of the
   * element and an outline offset.
   *
   * @param outline
   * @param element
   */
  updateShapeOutline(outline: SVGElement, element: Element): void;

  /**
   * Updates the outline of a connection respecting the bounding box of
   * the connection and an outline offset.
   * Register an outline provider with the given priority.
   *
   * @param outline
   * @param connection
   */
  updateConnectionOutline(outline: SVGElement, connection: Element): void;

  /**
   * Register an outline provider with the given priority.
   *
   * @param priority
   * @param provider
   */
  registerProvider(priority: number, provider: OutlineProvider): void;

  /**
   * Returns the outline for an element.
   *
   * @param element
   */
  getOutline(element: Element): undefined;
}

type Element = import('../../model/Types').Element;
type OutlineProvider = import('./OutlineProvider').default;
type EventBus = import('../../core/EventBus').default;
type Styles = import('../../draw/Styles').default;
