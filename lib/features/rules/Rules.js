/**
 * @typedef {import('didi').Injector} Injector
 */

/**
 * A service that provides rules for certain diagram actions.
 *
 * The default implementation will hook into the {@link CommandStack}
 * to perform the actual rule evaluation. Make sure to provide the
 * `commandStack` service with this module if you plan to use it.
 *
 * Together with this implementation you may use the {@link import('./RuleProvider').default}
 * to implement your own rule checkers.
 *
 * This module is ment to be easily replaced, thus the tiny foot print.
 *
 * @param {Injector} injector
 */
export default function Rules(injector) {
  this._commandStack = injector.get('commandStack', false);
}

Rules.$inject = [ 'injector' ];


/**
 * Returns whether or not a given modeling action can be executed
 * in the specified context.
 *
 * This implementation will respond with allow unless anyone
 * objects.
 *
 * @param {string} action The action to be allowed or disallowed.
 * @param {Object} [context] The context for allowing or disallowing the action.
 *
 * @return {boolean|null} Wether the action is allowed. Returns `null` if the action
 * is to be ignored.
 */
Rules.prototype.allowed = function(action, context) {
  var allowed = true;

  var commandStack = this._commandStack;

  if (commandStack) {
    allowed = commandStack.canExecute(action, context);
  }

  // map undefined to true, i.e. no rules
  return allowed === undefined ? true : allowed;
};