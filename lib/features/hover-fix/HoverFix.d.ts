/**
 * Browsers may swallow certain events (hover, out ...) if users are to
 * fast with the mouse.
 *
 * @see http://stackoverflow.com/questions/7448468/why-cant-i-reliably-capture-a-mouseout-event
 *
 * The fix implemented in this component ensure that we
 *
 * 1) have a hover state after a successful drag.move event
 * 2) have an out event when dragging leaves an element
 *
 */
export default class HoverFix {
  static $inject: string[];

  /**
   * @param elementRegistry
   * @param eventBus
   * @param injector
   */
  constructor(elementRegistry: ElementRegistry, eventBus: EventBus, injector: Injector);
}

type Injector = import('didi').Injector;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
