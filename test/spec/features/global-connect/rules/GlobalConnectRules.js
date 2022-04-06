import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function GlobalConnectRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

GlobalConnectRules.$inject = [ 'eventBus' ];

inherits(GlobalConnectRules, RuleProvider);

GlobalConnectRules.prototype.init = function() {

  this.addRule('connection.start', function(context) {
    var source = context.source;

    if (source.canStartConnection) {
      return true;
    }

    return false;
  });
};
