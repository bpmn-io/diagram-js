import { ElementLike } from "../core/Types";
import { CommandContext } from "./CommandStack";

/**
 * A command handler that may be registered via
 * {@link CommandStack#registerHandler}.
 */
export default interface CommandHandler {

  /**
   * Execute changes described in the passed action context.
   *
   * @param context The execution context.
   *
   * @return The list of diagram elements that have changed.
   */
  execute?(context: CommandContext): ElementLike[];

  /**
   * Revert changes described in the passed action context.
   *
   * @param context The execution context.
   *
   * @return The list of diagram elements that have changed.
   */
  revert?(context: CommandContext): ElementLike[];

  /**
   * Return true if the handler may execute in the given context.
   *
   * @param context The execution context.
   *
   * @return Whether the command can be executed.
   */
  canExecute?(context: CommandContext): boolean;

  /**
   * Execute actions before the actual command execution but
   * grouped together (for undo/redo) with the action.
   *
   * @param context The execution context.
   */
  preExecute?(context: CommandContext): void;

  /**
   * Execute actions after the actual command execution but
   * grouped together (for undo/redo) with the action.
   *
   * @param context The execution context.
   */
  postExecute?(context: CommandContext): void;
}