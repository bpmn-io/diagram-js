import inherits from 'inherits';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function ConnectRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ConnectRules.$inject = ['eventBus'];

inherits(ConnectRules, RuleProvider);


ConnectRules.prototype.init = function() {

  function isSameType(connection, newSource, newTarget) {
    var source = newSource || connection.source,
        target = newTarget || connection.target;

    return source.type === target.type;
  }

  this.addRule('connection.reconnectStart', function(context) {
    return isSameType(context.connection, context.hover);
  });

  this.addRule('connection.updateWaypoints', function(context) {
    return null;
  });

  this.addRule('connection.reconnectEnd', function(context) {
    return isSameType(context.connection, null, context.hover);
  });
};