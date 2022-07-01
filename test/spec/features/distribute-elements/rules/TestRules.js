import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function TestRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

TestRules.$inject = [ 'eventBus' ];

inherits(TestRules, RuleProvider);


TestRules.prototype.init = function() {
  var self = this;

  this.addRule('elements.distribute', function(context) {
    return self._result;
  });
};

TestRules.prototype.setResult = function(result) {
  this._result = result;
};
