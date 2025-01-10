/**
 * A basic provider that may be extended to implement modeling rules.
 *
 * Extensions should implement the init method to actually add their custom
 * modeling checks. Checks may be added via the #addRule(action, fn) method.
 *
 *
 */
export default class RuleProvider extends CommandInterceptor {
  /**
   * Adds a modeling rule for the given action, implemented through
   * a callback function.
   *
   * The callback receives a modeling specific action context
   * to perform its check. It must return `false` to disallow the
   * action from happening or `true` to allow the action. Usually returing
   * `null` denotes that a particular interaction shall be ignored.
   * By returning nothing or `undefined` you pass evaluation to lower
   * priority rules.
   *
   * @example
   *
   * ```javascript
   * ResizableRules.prototype.init = function() {
   *
   *   \/**
   *    * Return `true`, `false` or nothing to denote
   *    * _allowed_, _not allowed_ and _continue evaluating_.
   *    *\/
   *   this.addRule('shape.resize', function(context) {
   *
   *     var shape = context.shape;
   *
   *     if (!context.newBounds) {
   *       // check general resizability
   *       if (!shape.resizable) {
   *         return false;
   *       }
   *
   *       // not returning anything (read: undefined)
   *       // will continue the evaluation of other rules
   *       // (with lower priority)
   *       return;
   *     } else {
   *       // element must have minimum size of 10*10 points
   *       return context.newBounds.width > 10 && context.newBounds.height > 10;
   *     }
   *   });
   * };
   * ```
   *
   * @param actions the identifier for the modeling action to check
   * @param fn the callback function that performs the actual check
   */
  addRule(actions: string | string[], fn: (any: any) => any): void;

  /**
   * Adds a modeling rule for the given action, implemented through
   * a callback function.
   *
   * The callback receives a modeling specific action context
   * to perform its check. It must return `false` to disallow the
   * action from happening or `true` to allow the action. Usually returing
   * `null` denotes that a particular interaction shall be ignored.
   * By returning nothing or `undefined` you pass evaluation to lower
   * priority rules.
   *
   * @example
   *
   * ```javascript
   * ResizableRules.prototype.init = function() {
   *
   *   \/**
   *    * Return `true`, `false` or nothing to denote
   *    * _allowed_, _not allowed_ and _continue evaluating_.
   *    *\/
   *   this.addRule('shape.resize', function(context) {
   *
   *     var shape = context.shape;
   *
   *     if (!context.newBounds) {
   *       // check general resizability
   *       if (!shape.resizable) {
   *         return false;
   *       }
   *
   *       // not returning anything (read: undefined)
   *       // will continue the evaluation of other rules
   *       // (with lower priority)
   *       return;
   *     } else {
   *       // element must have minimum size of 10*10 points
   *       return context.newBounds.width > 10 && context.newBounds.height > 10;
   *     }
   *   });
   * };
   * ```
   *
   * @param actions the identifier for the modeling action to check
   * @param priority the priority at which this rule is being applied
   * @param fn the callback function that performs the actual check
   */
  addRule(actions: string | string[], priority: number, fn: (any: any) => any): void;

  /**
   * Implement this method to add new rules during provider initialization.
   */
  init(): void;
}

type EventBus = import('../../core/EventBus').default;
import CommandInterceptor from '../../command/CommandInterceptor';
