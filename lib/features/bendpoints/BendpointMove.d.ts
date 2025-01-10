export function isReverse(context: any): boolean;

/**
 * Move bendpoints through drag and drop to add/remove bendpoints or reconnect connection.
 *
 */
export default class BendpointMove {
  static $inject: string[];

  /**
   * @param injector
   * @param eventBus
   * @param canvas
   * @param dragging
   * @param rules
   * @param modeling
   */
  constructor(injector: Injector, eventBus: EventBus, canvas: Canvas, dragging: Dragging, rules: Rules, modeling: Modeling);

  start: (event: any, connection: any, bendpointIndex: any, insert: any) => void;
  cropWaypoints(connection: any, newWaypoints: any): any;
}

type Injector = import('didi').Injector;
type Canvas = import('../../core/Canvas').default;
type Dragging = import('../dragging/Dragging').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
