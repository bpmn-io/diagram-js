/**
 * A keyboard abstraction that may be activated and
 * deactivated by users at will, consuming global key events
 * and triggering diagram actions.
 *
 * For keys pressed down, keyboard fires `keyboard.keydown` event.
 * The event context contains one field which is `KeyboardEvent` event.
 *
 * The implementation fires the following key events that allow
 * other components to hook into key handling:
 *
 *  - keyboard.bind
 *  - keyboard.unbind
 *  - keyboard.init
 *  - keyboard.destroy
 *
 * All events contain one field which is node.
 *
 * Specify the initial keyboard binding state via the
 * `keyboard.bind=true|false` configuration option.
 *
 */
export default class Keyboard {
  static $inject: string[];

  /**
   * @param config
   * @param eventBus
   */
  constructor(config: {
      bind?: boolean;
  }, eventBus: EventBus);

  /**
   * Bind keyboard events to the canvas node.
   */
  bind(): void;

  /**
   * Bind keyboard events to the given DOM node.
   *
   * @deprecated No longer in use since version 15.0.0.
   *
   * @param node
   */
  bind(node: EventTarget): void;

  /**
   * @return
   */
  getBinding(): EventTarget;

  unbind(): void;

  /**
   * Add a listener function that is notified with `KeyboardEvent` whenever
   * the keyboard is bound and the user presses a key. If no priority is
   * provided, the default value of 1000 is used.
   *
   * @param listener
   * @param type
   */
  addListener(listener: Listener, type?: string): void;

  /**
   * Add a listener function that is notified with `KeyboardEvent` whenever
   * the keyboard is bound and the user presses a key. If no priority is
   * provided, the default value of 1000 is used.
   *
   * @param priority
   * @param listener
   * @param type
   */
  addListener(priority: number, listener: Listener, type?: string): void;

  /**
   * Remove a listener function.
   *
   * @param listener
   * @param type
   */
  removeListener(listener: Listener, type?: string): void;

  hasModifier: typeof hasModifier;
  isCmd: typeof isCmd;
  isShift: typeof isShift;
  isKey: typeof isKey;
}

type EventBus = import('../../core/EventBus').default;

export type Listener = ({ keyEvent: KeyboardEvent }: {
    keyEvent: any;
}) => any;

import { hasModifier } from './KeyboardUtil';
import { isCmd } from './KeyboardUtil';
import { isShift } from './KeyboardUtil';
import { isKey } from './KeyboardUtil';
