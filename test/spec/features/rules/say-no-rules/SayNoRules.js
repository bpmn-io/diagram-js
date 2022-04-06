import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function SayNoRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

SayNoRules.$inject = [ 'eventBus' ];

inherits(SayNoRules, RuleProvider);


SayNoRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {
    return false;
  });
};