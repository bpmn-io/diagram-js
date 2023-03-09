import Canvas from '../../core/Canvas';
import EventBus from '../../core/EventBus';

/**
 * A service that offers the current selection in a diagram.
 * Offers the api to control the selection, too.
 */
export default class Selection {
  constructor(eventBus: EventBus, canvas: Canvas);

  /**
   * Deselect an element.
   *
   * @param element The element to deselect.
   */
  deselect(element: Object): void;

  /**
   * Get the selected elements.
   *
   * @return The selected elements.
   */
  get(): Object[];

  /**
   * Check whether an element is selected.
   *
   * @param element The element.
   *
   * @return Whether the element is selected.
   */
  isSelected(element: Object): boolean;

  /**
   * Select one or many elements.
   *
   * @param elements The element(s) to select.
   * @param add Whether to add the element(s) to the selected elements.
   * Defaults to `false`.
   */
  select(elements: Object | Object[], add?: boolean): void;
}