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
 */
export default class Rules {
  static $inject: string[];

  /**
   * @param injector
   */
  constructor(injector: Injector);

  /**
   * Returns whether or not a given modeling action can be executed
   * in the specified context.
   *
   * This implementation will respond with allow unless anyone
   * objects.
   *
   * @param action The action to be allowed or disallowed.
   * @param context The context for allowing or disallowing the action.
   *
   * @return Wether the action is allowed. Returns `null` if the action
   * is to be ignored.
   */
  allowed(action: string, context?: any): boolean | null;
}

type Injector = import('didi').Injector;
