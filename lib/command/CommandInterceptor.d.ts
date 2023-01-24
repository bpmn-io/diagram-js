import EventBus from '../core/EventBus';

import { Base } from '../model';

type Events = string | string[];

type CommandContext = any;

type ComposeHandlerFunction = (context: CommandContext) => void;

type HandlerFunction = (context: CommandContext) => Base[] | void;

/**
 * A utility that can be used to plug-in into the command execution for
 * extension and/or validation.
 *
 * @param {EventBus} eventBus
 *
 * @example
 *
 * import inherits from 'inherits-browser';
 *
 * import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
 *
 * function CommandLogger(eventBus) {
 *   CommandInterceptor.call(this, eventBus);
 *
 *   this.preExecute(function(event) {
 *     console.log('command pre-execute', event);
 *   });
 * }
 *
 * inherits(CommandLogger, CommandInterceptor);
 *
 */
export default class CommandInterceptor {
  constructor(eventBus: EventBus);
  canExecute(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  canExecute(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  preExecute(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  preExecute(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  preExecuted(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  preExecuted(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  execute(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  execute(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  executed(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  executed(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  postExecute(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  postExecute(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  postExecuted(events: Events, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  postExecuted(events: Events, priority: number, handlerFn: ComposeHandlerFunction, unwrap?: boolean, that?: any): void;
  revert(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  revert(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  reverted(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  reverted(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
}