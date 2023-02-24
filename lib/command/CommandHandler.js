/**
 * @typedef {import('../core').ElementLike} ElementLike
 *
 * @typedef {import('./CommandStack').default} CommandStack
 * @typedef {import('./CommandStack').CommandContext} CommandContext
 */

/**
 *A command handler that may be registered via
 * {@link CommandStack#registerHandler}.
 *
 * @class
 * @constructor
 */
export default function CommandHandler() {}


/**
 * Execute changes described in the passed action context.
 *
 * @param {CommandContext} context The execution context.
 *
 * @return {ElementLike[]} The list of diagram elements that have changed.
 */
CommandHandler.prototype.execute = function(context) {};


/**
 * Revert changes described in the passed action context.
 *
 * @param {CommandContext} context The execution context.
 *
 * @return {ElementLike[]} The list of diagram elements that have changed.
 */
CommandHandler.prototype.revert = function(context) {};


/**
 * Return true if the handler may execute in the given context.
 *
 * @param {CommandContext} context The execution context.
 *
 * @return {boolean} Whether the command can be executed.
 */
CommandHandler.prototype.canExecute = function(context) {
  return true;
};


/**
 * Execute actions before the actual command execution but
 * grouped together (for undo/redo) with the action.
 *
 * @param {CommandContext} context The execution context.
 */
CommandHandler.prototype.preExecute = function(context) {};


/**
 * Execute actions after the actual command execution but
 * grouped together (for undo/redo) with the action.
 *
 * @param {CommandContext} context The execution context.
 */
CommandHandler.prototype.postExecute = function(context) {};