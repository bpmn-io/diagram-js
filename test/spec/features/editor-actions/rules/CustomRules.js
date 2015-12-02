'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function customRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

customRules.$inject = ['eventBus'];

inherits(customRules, RuleProvider);

module.exports = customRules;


customRules.prototype.init = function() {};
