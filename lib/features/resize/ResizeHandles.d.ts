/**
 * This component is responsible for adding resize handles.
 *
 */
export default class ResizeHandles {
  static $inject: string[];

  /**
   * @param eventBus
   * @param canvas
   * @param selection
   * @param resize
   */
  constructor(eventBus: EventBus, canvas: Canvas, selection: Selection, resize: Resize);

  makeDraggable(element: any, gfx: any, direction: any): void;
  createResizer(element: any, direction: any): void;

  /**
   * Add resizers for a given element.
   *
   * @param element
   */
  addResizer(element: Element): void;

  /**
   * Remove all resizers
   */
  removeResizers(): void;
}

type Element = import('../../model/Types').Element;
type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type Resize = import('../resize/Resize').default;
type Selection = import('../selection/Selection').default;
