import inherits from 'inherits';

import RuleProvider from 'lib/features/rules/RuleProvider';

export default function CreateRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CreateRules.$inject = [ 'eventBus' ];

inherits(CreateRules, RuleProvider);


CreateRules.prototype.init = function() {

  this.addRule('shape.attach', function(context) {

    var target = context.target;

    // can attach to host
    if (/host/.test(target.id)) {
      return 'attach';
    }

    return false;
  });


  this.addRule('connection.create', function(context) {

    var source = context.source,
        target = context.target,
        hints = context.hints;

    expect(source.parent).to.exist;
    expect(target.parent).not.to.exist;

    expect(hints).to.have.keys([
      'targetParent',
      'targetAttach'
    ]);

    // can connect from parent or child
    return /parent|child/.test(source.id);
  });


  this.addRule('shape.create', function(context) {

    var target = context.target;

    if (/ignore/.test(target.id)) {
      return null;
    }

    // can create on parent or root,
    // no connect, no attach
    if (/parent|root/.test(target.id)) {
      return true;
    }

    return false;
  });

};
