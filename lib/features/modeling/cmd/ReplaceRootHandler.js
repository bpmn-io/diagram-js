/**
 * Replace a given root Object by: (1) moving children from old root object to
 * the new root object, and (2) replacing the old canvas root object by the
 * newly created root object.
 *
 * @class
 * @constructor
 *
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 * @param {Canvas} canvas
 */
export default function ReplaceRootHandler(modeling, canvas) {
  this._modeling = modeling;
  this._canvas = canvas;
}

ReplaceRootHandler.$inject = [ 'modeling', 'canvas' ];


/**
 * Replace the root element.
 *
 * @param {Object} context
 * @param {djs.model.Root} context.oldRoot
 * @param {Object} context.newData
 * @param {string} context.newData.id
 */
ReplaceRootHandler.prototype.preExecute = function(context) {
  var self = this,
      modeling = self._modeling;

  var oldRoot = context.oldRoot,
      newRoot = context.newRoot;

  // (1) Re-assign children to newRoot
  var children;

  children = oldRoot.children.slice();

  modeling.moveElements(children, { x: 0, y: 0 }, newRoot);

  // (2) Override root
  modeling.updateRoot(newRoot);
};
