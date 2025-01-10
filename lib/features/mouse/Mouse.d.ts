export function createMoveEvent(x: any, y: any): MouseEvent;

export default class Mouse {
  static $inject: string[];

  /**
   * @param eventBus
   */
  constructor(eventBus: EventBus);

  getLastMoveEvent(): any;
}

type EventBus = import('../../core/EventBus').default;
