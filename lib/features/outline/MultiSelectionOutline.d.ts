/**
 *
 * A plugin that adds an outline to shapes and connections that may be activated and styled
 * via CSS classes.
 *
 */
export default class MultiSelectionOutline {
  static $inject: string[];

  /**
   * @param eventBus
   * @param canvas
   * @param selection
   */
  constructor(eventBus: EventBus, canvas: Canvas, selection: Selection);
}

type Element = import('../../model/Types').Element;
type EventBus = import('../../core/EventBus').default;
type Selection = import('../selection/Selection').default;
type Canvas = import('../../core/Canvas').default;
