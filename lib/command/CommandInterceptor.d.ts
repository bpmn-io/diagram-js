/**
 * A utility that can be used to plug into the command execution for
 * extension and/or validation.
 *
 *
 * @example
 *
 * ```javascript
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
 * ```
 *
 */
export default class CommandInterceptor {
  static $inject: string[];

  /**
   * @param eventBus
   */
  constructor(eventBus: EventBus);

  /**
   * Intercept a command during one of the phases.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Intercept a command during one of the phases.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Intercept a command during one of the phases.
   *
   * @param hook phase to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    hook: string,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Intercept a command during one of the phases.
   *
   * @param hook phase to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    hook: string,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Intercept a command during one of the phases.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Intercept a command during one of the phases.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Intercept a command during one of the phases.
   *
   * @param events command(s) to intercept
   * @param hook phase to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    events: Events,
    hook: string,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Intercept a command during one of the phases.
   *
   * @param events command(s) to intercept
   * @param hook phase to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  on(
    events: Events,
    hook: string,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <canExecute> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  canExecute(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <canExecute> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  canExecute(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <canExecute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  canExecute(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <canExecute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  canExecute(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecute> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecute(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecute> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecute(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecute(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecute(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecuted> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecuted(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecuted> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecuted(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecuted> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecuted(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <preExecuted> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  preExecuted(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <execute> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  execute(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <execute> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  execute(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <execute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  execute(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <execute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  execute(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <executed> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  executed(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <executed> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  executed(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <executed> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  executed(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <executed> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  executed(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecute> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecute(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecute> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecute(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecute(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecute> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecute(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecuted> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecuted(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecuted> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecuted(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecuted> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecuted(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <postExecuted> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  postExecuted(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <revert> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  revert(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <revert> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  revert(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <revert> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  revert(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <revert> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  revert(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <reverted> phase of command interceptor.
   *
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  reverted(
    this: CommandInterceptor,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <reverted> phase of command interceptor.
   *
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  reverted(
    this: CommandInterceptor,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <reverted> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  reverted(
    this: CommandInterceptor,
    events: Events,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;

  /**
   * Add a <reverted> phase of command interceptor.
   *
   * @param events command(s) to intercept
   * @param priority
   * @param handlerFn
   * @param unwrap whether the event should be unwrapped
   * @param that
   */
  reverted(
    this: CommandInterceptor,
    events: Events,
    priority: number,
    handlerFn: ComposeHandlerFunction | HandlerFunction,
    unwrap?: boolean,
    that?: any
  ): void;
}

type ElementLike = import('../core/Types').ElementLike;
type EventBus = import('../core/EventBus').default;
type CommandContext = import('./CommandStack').CommandContext;
export type Events = string | string[];
export type HandlerFunction = (context: CommandContext) => ElementLike[] | void;
export type ComposeHandlerFunction = (context: CommandContext) => void;
