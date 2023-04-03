/**
 * A service that offers the current selection in a diagram.
 * Offers the api to control the selection, too.
 *
 */
export default class Selection {
  static $inject: string[];

  /**
   * @param eventBus
   * @param canvas
   */
  constructor(eventBus: EventBus, canvas: Canvas);

  /**
   * Deselect an element.
   *
   * @param element The element to deselect.
   */
  deselect(element: any): void;

  /**
   * Get the selected elements.
   *
   * @return The selected elements.
   */
  get(): any[];

  /**
   * Check whether an element is selected.
   *
   * @param element The element.
   *
   * @return Whether the element is selected.
   */
  isSelected(element: any): boolean;

  /**
   * Select one or many elements.
   *
   * @param elements The element(s) to select.
   * @param add Whether to add the element(s) to the selected elements.
   * Defaults to `false`.
   */
  select(elements: any | any[], add?: boolean): void;
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
