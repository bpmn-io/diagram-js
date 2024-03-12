import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider.js';

import {
  isFrameElement
} from 'lib/util/Elements.js';

export default function ConnectRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ConnectRules.$inject = [ 'eventBus' ];

inherits(ConnectRules, RuleProvider);


ConnectRules.prototype.init = function() {

  this.addRule('connection.create', function(context) {
    var source = context.source,
        target = context.target;

    if (isFrameElement(source) || isFrameElement(target)) {
      return false;
    }

    if (source && target && source.parent === target.parent) {
      return { type: 'test:Connection' };
    }

    return false;
  });
};
