/**
 * @typedef { import('../model').Base } Base
 * @typedef { import('./CommandStack').default } CommandStack
 *
 * @typedef { any } CommandContext
 */

/**
 * A command handler that may be registered via
 * {@link CommandStack#registerHandler}.
 */
export default function CommandHandler() {}


/**
 * Execute changes described in the passed action context.
 *
 * @param {CommandContext} context the execution context
 *
 * @return {Base[]} list of touched (áka dirty) diagram elements
 */
CommandHandler.prototype.execute = function(context) {};


/**
 * Revert changes described in the passed action context.
 *
 * @param {CommandContext} context the execution context
 *
 * @return {Base[]} list of touched (áka dirty) diagram elements
 */
CommandHandler.prototype.revert = function(context) {};


/**
 * Return true if the handler may execute in the given context.
 *
 * @abstract
 *
 * @param {CommandContext} context the execution context
 *
 * @return {boolean} true if executing in the context is possible
 */
CommandHandler.prototype.canExecute = function(context) {
  return true;
};


/**
 * Execute actions before the actual command execution but
 * grouped together (for undo/redo) with the action.
 *
 * @param {CommandContext} context the execution context
 */
CommandHandler.prototype.preExecute = function(context) {};


/**
 * Execute actions after the actual command execution but
 * grouped together (for undo/redo) with the action.
 *
 * @param {CommandContext} context the execution context
 */
CommandHandler.prototype.postExecute = function(context) {};