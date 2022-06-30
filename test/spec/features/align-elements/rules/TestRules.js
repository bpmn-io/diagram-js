import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function TestRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

TestRules.$inject = [ 'eventBus' ];

inherits(TestRules, RuleProvider);


TestRules.prototype.init = function() {

  this.addRule('elements.align', function(context) {
    return false;
  });
};