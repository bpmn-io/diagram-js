import inherits from 'inherits-browser';

import CommandInterceptor from '../../command/CommandInterceptor';

/**
 * @typedef {import('../../core/EventBus').default} EventBus
 */

/**
 * A basic provider that may be extended to implement modeling rules.
 *
 * Extensions should implement the init method to actually add their custom
 * modeling checks. Checks may be added via the #addRule(action, fn) method.
 *
 * @class
 *
 * @param {EventBus} eventBus
 */
export default function RuleProvider(eventBus) {
  CommandInterceptor.call(this, eventBus);

  this.init();
}

RuleProvider.$inject = [ 'eventBus' ];

inherits(RuleProvider, CommandInterceptor);


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
 * @param {string|string[]} actions the identifier for the modeling action to check
 * @param {number} [priority] the priority at which this rule is being applied
 * @param {(any) => any} fn the callback function that performs the actual check
 */
RuleProvider.prototype.addRule = function(actions, priority, fn) {

  var self = this;

  if (typeof actions === 'string') {
    actions = [ actions ];
  }

  actions.forEach(function(action) {

    self.canExecute(action, priority, function(context, action, event) {
      return fn(context);
    }, true);
  });
};

/**
 * Implement this method to add new rules during provider initialization.
 */
RuleProvider.prototype.init = function() {};