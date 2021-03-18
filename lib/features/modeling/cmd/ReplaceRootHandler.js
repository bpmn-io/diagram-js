/**
 * Replace root by adding new root, removing old root and moving children.
 *
 * @class
 * @constructor
 *
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 * @param {Canvas} canvas
 */
export default function ReplaceRootHandler(modeling, elementFactory, canvas) {
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._canvas = canvas;
}

ReplaceRootHandler.$inject = [ 'modeling', 'elementFactory', 'canvas' ];


/**
 * Insert a new Root.
 *
 * @param {Object} context
 * @param {djs.model.Root} context.oldRoot
 * @param {Object} context.newData
 * @param {string} context.newData.id
 * @param {Object} [hints]
 */
ReplaceRootHandler.prototype.preExecute = function(context) {
  var self = this,
      modeling = this._modeling;

  var oldRoot = context.oldRoot,
      newData = context.newData,
      hints = context.hints || {},
      newRoot;

  // (1) Create new root
  newRoot = context.newRoot = self._createRoot(newData, hints);

  // (2) Re-assign children to newRoot
  var children;

  children = oldRoot.children.slice();

  modeling.moveElements(children, { x: 0, y: 0 }, newRoot, hints);

  // (3) Override root
  modeling.updateRoot(newRoot);
};


ReplaceRootHandler.prototype.postExecute = function(context) {};


ReplaceRootHandler.prototype.execute = function(context) {};


ReplaceRootHandler.prototype.revert = function(context) {};


ReplaceRootHandler.prototype._createRoot = function(data) {
  return this._elementFactory.createRoot(data);
};
