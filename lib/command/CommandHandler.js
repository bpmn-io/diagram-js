/**
 * A command handler that may be registered with the
 * {@link CommandStack} via {@link CommandStack#registerHandler}.
 */
export default class CommandHandler {
 /**
  * Execute changes described in the passed action context.
  *
  * @param {Object} context the execution context
  *
  * @return {Array<djs.model.Base>} list of touched (áka dirty) diagram elements
  */
 execute(context) {}

 /**
  * Revert changes described in the passed action context.
  *
  * @param {Object} context the execution context
  *
  * @return {Array<djs.model.Base>} list of touched (áka dirty) diagram elements
  */
 revert(context) {}

 /**
  * Return true if the handler may execute in the given context.
  *
  * @abstract
  *
  * @param {Object} context the execution context
  *
  * @return {boolean} true if executing in the context is possible
  */
 canExecute(context) {
   return true;
 }

 /**
  * Execute actions before the actual command execution but
  * grouped together (for undo/redo) with the action.
  *
  * @param {Object} context the execution context
  */
 preExecute(context) {}

 /**
  * Execute actions after the actual command execution but
  * grouped together (for undo/redo) with the action.
  *
  * @param {Object} context the execution context
  */
 postExecute(context) {}
}