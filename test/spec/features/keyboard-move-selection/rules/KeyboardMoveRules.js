import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

import { find } from 'min-dash';

export default function CreateRules(injector) {
  injector.invoke(RuleProvider, this);
}

CreateRules.$inject = [ 'injector' ];

inherits(CreateRules, RuleProvider);


CreateRules.prototype.init = function() {

  this.addRule('elements.move', function(context) {
    var shapes = context.shapes;

    return !find(shapes, function(shape) {
      return shape.id === 'shapeDisallowed';
    });
  });

};
