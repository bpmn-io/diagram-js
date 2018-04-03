import MoveHelper from './helper/MoveHelper';


/**
 * A handler that implements reversible moving of shapes.
 */
export default function MoveElementsHandler(modeling) {
  this._helper = new MoveHelper(modeling);
}

MoveElementsHandler.$inject = [ 'modeling' ];

MoveElementsHandler.prototype.preExecute = function(context) {
  context.closure = this._helper.getClosure(context.shapes);
};

MoveElementsHandler.prototype.postExecute = function(context) {

  var hints = context.hints,
      primaryShape;

  if (hints && hints.primaryShape) {
    primaryShape = hints.primaryShape;
    hints.oldParent = primaryShape.parent;
  }

  this._helper.moveClosure(
    context.closure,
    context.delta,
    context.newParent,
    context.newHost,
    primaryShape
  );
};