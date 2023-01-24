import { Base } from '../model';

import CommandStack from './CommandStack';


export type CommandContext = any;

/**
 * A command handler that may be registered via
 * {@link CommandStack#registerHandler}.
 */
export default interface CommandHandler {

  /**
   * Execute changes described in the passed action context.
   *
   * @param {Object} context the execution context
   *
   * @return {Base[]} list of touched (áka dirty) diagram elements
   */
  execute?(context: CommandContext): Base[];

  /**
   * Revert changes described in the passed action context.
   *
   * @param {Object} context the execution context
   *
   * @return {Base[]} list of touched (áka dirty) diagram elements
   */
  revert?(context: CommandContext): Base[];

  /**
   * Return true if the handler may execute in the given context.
   *
   * @abstract
   *
   * @param {Object} context the execution context
   *
   * @return {boolean} true if executing in the context is possible
   */
  canExecute?(context: CommandContext): boolean;

  /**
   * Execute actions before the actual command execution but
   * grouped together (for undo/redo) with the action.
   *
   * @param {Object} context the execution context
   */
  preExecute?(context: CommandContext): void;

  /**
   * Execute actions after the actual command execution but
   * grouped together (for undo/redo) with the action.
   *
   * @param {Object} context the execution context
   */
  postExecute?(context: CommandContext): void;
}