import RuleProvider from '../rules/RuleProvider';

import inherits from 'inherits-browser';

/**
 * @typedef {import('../../model/Types').Shape} Shape
 *
 * @typedef {import('../../core/EventBus').default} EventBus
 */

/**
 * This is a base rule provider for the element.autoResize rule.
 *
 * @param {EventBus} eventBus
 */
export default function AutoResizeProvider(eventBus) {

  RuleProvider.call(this, eventBus);

  var self = this;

  this.addRule('element.autoResize', function(context) {
    return self.canResize(context.elements, context.target);
  });
}

AutoResizeProvider.$inject = [ 'eventBus' ];

inherits(AutoResizeProvider, RuleProvider);

/**
 * Needs to be implemented by sub classes to allow actual auto resize
 *
 * @param {Shape[]} elements
 * @param {Shape} target
 *
 * @return {boolean}
 */
AutoResizeProvider.prototype.canResize = function(elements, target) {
  return false;
};