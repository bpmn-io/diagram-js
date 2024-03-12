import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider.js';

export default function CustomRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CustomRules.$inject = [ 'eventBus' ];

inherits(CustomRules, RuleProvider);