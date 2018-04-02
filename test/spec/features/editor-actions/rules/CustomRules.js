'use strict';

import inherits from 'inherits';

import RuleProvider from 'lib/features/rules/RuleProvider';

function CustomRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CustomRules.$inject = ['eventBus'];

inherits(CustomRules, RuleProvider);

module.exports = CustomRules;
