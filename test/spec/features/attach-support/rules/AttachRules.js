import inherits from 'inherits-browser';

import RuleProvider from 'lib/features/rules/RuleProvider';

import { forEach } from 'min-dash';

export default function AttachRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

AttachRules.$inject = [ 'eventBus' ];

inherits(AttachRules, RuleProvider);


AttachRules.prototype.init = function() {

  this.addRule('elements.move', function(context) {

    if (context.target && context.target.retainAttachmentIds) {
      var attachmentIds = context.target.retainAttachmentIds;

      return retainmentAllowed(attachmentIds, context.shapes);
    }
  });

  this.addRule('elements.move', function(context) {
    var shapes = context.shapes,
        target = context.target;

    if (shapes.length === 1 && shapes[0].id === 'attacher' && target) {

      if (target.id === 'host' || target.id === 'host2') {
        return 'attach';
      } else if (target.id === 'parent') {
        return true;
      } else {
        return false;
      }
    }

    if (shapes.length === 1 && shapes[0].id === 'attacher2') {
      return false;
    }
  });

  this.addRule('connection.reconnect', function(context) {

    // do not allow reconnection to element
    // that is attached to #parent element

    var source = context.source,
        target = context.target;

    function isChildOfElementWithIdParent(element) {
      return element && element.parent.id === 'parent';
    }

    return ![
      source.host,
      target.host
    ].some(isChildOfElementWithIdParent);
  });

  // restrict resizing only for hosts (defaults to allow all)
  this.addRule('shape.resize', function(context) {
    var shape = context.shape;

    return shape.attachers.length > 0 && shape.resizable !== false;
  });
};


/**
 * Returns 'attach' if all shape ids are contained in the attachmentIds array.
 * Returns false if at least one of the shapes is not contained.
 *
 * @param  {Array<string>} attachmentIds
 * @param  {Array<Object>} shapes
 */
function retainmentAllowed(attachmentIds, shapes) {
  var allowed = 'attach';
  forEach(shapes, function(shape) {
    if (attachmentIds.indexOf(shape.id) === -1) {
      allowed = false;
      return;
    }
  });
  return allowed;
}
