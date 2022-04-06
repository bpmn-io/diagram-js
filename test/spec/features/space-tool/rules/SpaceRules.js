import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function SpaceRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

SpaceRules.$inject = [ 'eventBus' ];

inherits(SpaceRules, RuleProvider);


SpaceRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {
    var shape = context.shape;

    return shape.children.length > 0 || shape.id === 'shape';
  });
};