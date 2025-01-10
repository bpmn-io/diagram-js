/**
 * A service that offers un- and redoable execution of commands.
 *
 * The command stack is responsible for executing modeling actions
 * in a un- and redoable manner. To do this it delegates the actual
 * command execution to {@link CommandHandler}s.
 *
 * Command handlers provide {@link CommandHandler#execute(ctx)} and
 * {@link CommandHandler#revert(ctx)} methods to un- and redo a command
 * identified by a command context.
 *
 *
 * ## Life-Cycle events
 *
 * In the process the command stack fires a number of life-cycle events
 * that other components to participate in the command execution.
 *
 *    * preExecute
 *    * preExecuted
 *    * execute
 *    * executed
 *    * postExecute
 *    * postExecuted
 *    * revert
 *    * reverted
 *
 * A special event is used for validating, whether a command can be
 * performed prior to its execution.
 *
 *    * canExecute
 *
 * Each of the events is fired as `commandStack.{eventName}` and
 * `commandStack.{commandName}.{eventName}`, respectively. This gives
 * components fine grained control on where to hook into.
 *
 * The event object fired transports `command`, the name of the
 * command and `context`, the command context.
 *
 *
 * ## Creating Command Handlers
 *
 * Command handlers should provide the {@link CommandHandler#execute(ctx)}
 * and {@link CommandHandler#revert(ctx)} methods to implement
 * redoing and undoing of a command.
 *
 * A command handler _must_ ensure undo is performed properly in order
 * not to break the undo chain. It must also return the shapes that
 * got changed during the `execute` and `revert` operations.
 *
 * Command handlers may execute other modeling operations (and thus
 * commands) in their `preExecute(d)` and `postExecute(d)` phases. The command
 * stack will properly group all commands together into a logical unit
 * that may be re- and undone atomically.
 *
 * Command handlers must not execute other commands from within their
 * core implementation (`execute`, `revert`).
 *
 *
 * ## Change Tracking
 *
 * During the execution of the CommandStack it will keep track of all
 * elements that have been touched during the command's execution.
 *
 * At the end of the CommandStack execution it will notify interested
 * components via an 'elements.changed' event with all the dirty
 * elements.
 *
 * The event can be picked up by components that are interested in the fact
 * that elements have been changed. One use case for this is updating
 * their graphical representation after moving / resizing or deletion.
 *
 * @see CommandHandler
 *
 */
export default class CommandStack {
  static $inject: string[];

  /**
   * @param eventBus
   * @param injector
   */
  constructor(eventBus: EventBus, injector: Injector);

  /**
   * Execute a command.
   *
   * @param command The command to execute.
   * @param context The context with which to execute the command.
   */
  execute(command: string, context: CommandContext): void;

  /**
   * Check whether a command can be executed.
   *
   * Implementors may hook into the mechanism on two ways:
   *
   *   * in event listeners:
   *
   *     Users may prevent the execution via an event listener.
   *     It must prevent the default action for `commandStack.(<command>.)canExecute` events.
   *
   *   * in command handlers:
   *
   *     If the method {@link CommandHandler#canExecute} is implemented in a handler
   *     it will be called to figure out whether the execution is allowed.
   *
   * @param command The command to execute.
   * @param context The context with which to execute the command.
   *
   * @return Whether the command can be executed with the given context.
   */
  canExecute(command: string, context: CommandContext): boolean;

  /**
   * Clear the command stack, erasing all undo / redo history.
   *
   * @param emit Whether to fire an event. Defaults to `true`.
   */
  clear(emit?: boolean): void;

  /**
   * Undo last command(s)
   */
  undo(): void;

  /**
   * Redo last command(s)
   */
  redo(): void;

  /**
   * Register a handler instance with the command stack.
   *
   * @param command Command to be executed.
   * @param handler Handler to execute the command.
   */
  register(command: string, handler: CommandHandler): void;

  /**
   * Register a handler type with the command stack  by instantiating it and
   * injecting its dependencies.
   *
   * @param command Command to be executed.
   * @param handlerCls Constructor to instantiate a {@link CommandHandler}.
   */
  registerHandler(command: string, handlerCls: CommandHandlerConstructor): void;

  /**
   * @return
   */
  canUndo(): boolean;

  /**
   * @return
   */
  canRedo(): boolean;
}

type Injector = import('didi').Injector;
type ElementLike = import('../core/Types').ElementLike;
type EventBus = import('../core/EventBus').default;
type CommandHandler = import('./CommandHandler').default;
export type CommandContext = any;
export type CommandHandlerConstructor = new (...args: any[]) => CommandHandler;

export type CommandHandlerMap = {
    [key: string]: import("./CommandHandler").default;
};

export type CommandStackAction = {
    command: string;
    context: any;
    id?: any;
};

export type CurrentExecution = {
    actions: CommandStackAction[];
    dirty: ElementLike[];
    trigger: 'execute' | 'undo' | 'redo' | 'clear' | null;
    atomic?: boolean;
};
