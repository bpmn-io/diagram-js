import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function ResizeRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ResizeRules.$inject = [ 'eventBus' ];

inherits(ResizeRules, RuleProvider);


ResizeRules.prototype.init = function() {

  this.addRule('shape.resize', function(context) {

    var shape = context.shape;

    if (!context.newBounds) {

      // check general resizability
      if (!shape.resizable) {
        return false;
      }
    } else {
      if (shape.resizable === 'always') {
        return true;
      }

      // element must have minimum size of 50*50 points
      return context.newBounds.width > 50 && context.newBounds.height > 50;
    }
  });
};