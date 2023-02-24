import EventBus from '../core/EventBus';

import { ElementLike } from '../core';

import { CommandContext } from './CommandStack';

type Events = string | string[];

export type ComposeHandlerFunction = (context: CommandContext) => void;

export type HandlerFunction = (context: CommandContext) => ElementLike[] | void;

/**
 * A utility that can be used to plug into the command execution for
 * extension and/or validation.
 *
 * @param eventBus
 *
 * @example
 *
 * import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
 *
 * class CommandLogger extends CommandInterceptor {
 *   constructor(eventBus) {
 *     super(eventBus);
 *
 *   this.preExecute('shape.create', (event) => {
 *     console.log('commandStack.shape-create.preExecute', event);
 *   });
 * }
 */
export default class CommandInterceptor {
  constructor(eventBus: EventBus);

  /**
   * Check whether one or more commands can be executed.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  canExecute(handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Check whether one or more commands can be executed.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  canExecute(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Check whether one or more commands can be executed.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  canExecute(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands pre-execute.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  preExecute(handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;


  /**
   * Intercept one or more commands pre-execute.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  preExecute(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands pre-execute.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  preExecute(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands pre-executed.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  preExecuted(handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands pre-executed.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  preExecuted(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands pre-executed.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  preExecuted(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands during execution.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  execute(handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands during execution.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  execute(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands during execution.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  execute(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands after execution.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  executed(handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands after execution.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  executed(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands after execution.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  executed(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands post-execute.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  postExecute(handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands post-execute.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  postExecute(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands post-execute.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  postExecute(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands post-executed.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  postExecuted(handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands post-executed.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  postExecuted(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands post-executed.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  postExecuted(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands during revert.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  revert(handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands during revert.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  revert(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands during revert.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  revert(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands after revert.
   *
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  reverted(handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands after revert.
   *
   * @param events One or more commands to intercept.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  reverted(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;

  /**
   * Intercept one or more commands after revert.
   *
   * @param events One or more commands to intercept.
   * @param priority Priority with which command will be intercepted.
   * @param handlerFn Callback.
   * @param unwrap Whether the event should be unwrapped.
   * @param that `this` value the callback will be called with.
   */
  reverted(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
}