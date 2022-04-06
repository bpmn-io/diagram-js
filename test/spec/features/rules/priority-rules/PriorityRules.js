import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';


var HIGH_PRIORITY = 1500;


export default function PriorityRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

PriorityRules.$inject = [ 'eventBus' ];

inherits(PriorityRules, RuleProvider);


PriorityRules.prototype.init = function() {

  // a allow+block list containing
  // element ids
  var allowList = [
    'always-resizable'
  ];

  var blockList = [
    'never-resizable'
  ];


  this.addRule('shape.resize', function(context) {
    return context.shape.resizable;
  });


  this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
    var shape = context.shape;

    if (allowList.indexOf(shape.id) !== -1) {
      return true;
    }

    if (blockList.indexOf(shape.id) !== -1) {
      return false;
    }
  });

};
