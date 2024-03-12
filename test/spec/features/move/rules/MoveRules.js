import inherits from 'inherits-browser';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider.js';

import {
  isFrameElement
} from 'diagram-js/lib/util/Elements.js';


export default function MoveRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

MoveRules.$inject = [ 'eventBus' ];

inherits(MoveRules, RuleProvider);


MoveRules.prototype.init = function() {

  this.addRule('elements.move', function(context) {
    var target = context.target,
        shapes = context.shapes;

    if (target && /ignore/.test(target.id)) {
      return null;
    }

    // not allowed to move on frame elements
    if (isFrameElement(target)) {
      return false;
    }

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
