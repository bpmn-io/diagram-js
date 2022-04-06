import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function TestRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

TestRules.$inject = [ 'eventBus' ];

inherits(TestRules, RuleProvider);


TestRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {

    var shape = context.shape;

    if (shape.ignoreResize) {
      return null;
    }

    return shape.resizable !== undefined ? shape.resizable : undefined;
  });
};