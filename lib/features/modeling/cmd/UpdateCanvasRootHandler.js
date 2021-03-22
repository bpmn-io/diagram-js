import {
  Root
} from '../../../model';

/**
 * A handler that implements reversible update of the root element. Updating to
 * a new root replaces the old root element. This includes the removal of child
 * elements.
 *
 * @class
 * @constructor
 *
 * @param {Canvas} canvas
 */
export default function UpdateCanvasRootHandler(canvas) {
  this._canvas = canvas;
}

UpdateCanvasRootHandler.$inject = [ 'canvas' ];


/**
 * Update  the root element (i.e. set to a new root)
 *
 * @param {Object} context
* @param {djs.model.Base} context.newRoot the new root object
 */
UpdateCanvasRootHandler.prototype.execute = function(context) {
  var newRoot = context.newRoot;

  var self = this,
      canvas = self._canvas;

  if (!newRoot) {
    throw new Error('newRoot required');
  }

  if (!(newRoot instanceof Root)) {
    throw new Error('newRoot must be a Root object');
  }

  // (1) remember old root
  context.oldRoot = canvas.getRootElement();

  // (2) set new root
  canvas.setRootElement(newRoot, true);

  return newRoot;
};


/**
 * Undo the update by setting to the old root
 */
UpdateCanvasRootHandler.prototype.revert = function(context) {
  var oldRoot = context.oldRoot;

  var self = this,
      canvas = self._canvas;

  canvas.setRootElement(oldRoot, true);

  return oldRoot;
};
