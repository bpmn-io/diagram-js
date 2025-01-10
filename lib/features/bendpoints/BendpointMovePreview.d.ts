/**
 * Preview connection while moving bendpoints.
 *
 */
export default class BendpointMovePreview {
  static $inject: string[];

  /**
   * @param bendpointMove
   * @param injector
   * @param eventBus
   * @param canvas
   */
  constructor(bendpointMove: BendpointMove, injector: Injector, eventBus: EventBus, canvas: Canvas);
}

type Injector = import('didi').Injector;
type BendpointMove = import('../bendpoints/BendpointMove').default;
type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
