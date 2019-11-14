import inherits from 'inherits';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function ConnectRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ConnectRules.$inject = ['eventBus'];

inherits(ConnectRules, RuleProvider);


ConnectRules.prototype.init = function() {

  this.addRule('connection.reconnect', function(context) {

    var source = context.source,
        target = context.target;

    return source.type === target.type;
  });

  this.addRule('connection.updateWaypoints', function(context) {
    return true;
  });

};