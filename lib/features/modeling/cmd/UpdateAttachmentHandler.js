import {
  add as collectionAdd,
  remove as collectionRemove
} from '../../../util/Collections';

/**
 * A handler that implements reversible attaching/detaching of shapes.
 */
export default function UpdateAttachmentHandler(modeling) {
  this._modeling = modeling;
}

UpdateAttachmentHandler.$inject = [ 'modeling' ];


UpdateAttachmentHandler.prototype.execute = function(context) {
  var shape = context.shape,
      newHost = context.newHost,
      oldHost = shape.host;

  // (0) detach from old host
  context.oldHost = oldHost;
  context.attacherIdx = removeAttacher(oldHost, shape);

  // (1) attach to new host
  addAttacher(newHost, shape);

  // (2) update host
  shape.host = newHost;

  return shape;
};

UpdateAttachmentHandler.prototype.revert = function(context) {
  var shape = context.shape,
      newHost = context.newHost,
      oldHost = context.oldHost,
      attacherIdx = context.attacherIdx;

  // (2) update host
  shape.host = oldHost;

  // (1) attach to new host
  removeAttacher(newHost, shape);

  // (0) detach from old host
  addAttacher(oldHost, shape, attacherIdx);

  return shape;
};


function removeAttacher(host, attacher) {

  // remove attacher from host
  return collectionRemove(host && host.attachers, attacher);
}

function addAttacher(host, attacher, idx) {

  if (!host) {
    return;
  }

  var attachers = host.attachers;

  if (!attachers) {
    host.attachers = attachers = [];
  }

  collectionAdd(attachers, attacher, idx);
}
