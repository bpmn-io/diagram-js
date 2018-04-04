import inherits from 'inherits';

import RuleProvider from 'lib/features/rules/RuleProvider';


export default function CopyPasteRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CopyPasteRules.$inject = [ 'eventBus' ];

inherits(CopyPasteRules, RuleProvider);


CopyPasteRules.prototype.init = function() {

  this.addRule('element.copy', function(context) {
    var element = context.element;

    if (element.host) {
      return false;
    }

    return true;
  });

  this.addRule('element.paste', function(context) {
    if (context.source) {
      return false;
    }

    return true;
  });

  this.addRule('elements.paste', function(context) {
    if (context.target.id === 'parent2') {
      return false;
    }

    return true;
  });
};
