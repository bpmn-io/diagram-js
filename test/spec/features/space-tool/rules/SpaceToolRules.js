import inherits from 'inherits-browser';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider.js';

export default function SpaceToolRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

SpaceToolRules.$inject = [ 'eventBus' ];

inherits(SpaceToolRules, RuleProvider);


SpaceToolRules.prototype.init = function() {
  this.addRule('shape.resize', function(context) {
    var shape = context.shape;

    return shape.id.includes('resizable');
  });
};