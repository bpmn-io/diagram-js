import inherits from 'inherits';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function MoveRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

MoveRules.$inject = [ 'eventBus' ];

inherits(MoveRules, RuleProvider);


MoveRules.prototype.init = function() {

  this.addRule('elements.move', function(context) {
    var target = context.target,
        shapes = context.shapes;

    // check that we do not accidently try to drop elements
    // onto themselves or children of themselves
    while (target) {
      if (shapes.indexOf(target) !== -1) {
        return false;
      }

      target = target.parent;
    }
  });

};
