/**
 * A plugin that adds a visible selection UI to shapes and connections
 * by appending the <code>hover</code> and <code>selected</code> classes to them.
 *
 *
 * Makes elements selectable, too.
 *
 */
export default class SelectionVisuals {
  static $inject: string[];

  /**
   * @param canvas
   * @param eventBus
   */
  constructor(canvas: Canvas, eventBus: EventBus);
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
