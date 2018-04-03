import { forEach } from 'min-dash';

import {
  resizeBounds
} from '../../space-tool/SpaceUtil';


/**
 * A handler that implements reversible creating and removing of space.
 *
 * It executes in two phases:
 *
 *  (1) resize all affected resizeShapes
 *  (2) move all affected moveElements
 */
export default function SpaceToolHandler(modeling) {
  this._modeling = modeling;
}

SpaceToolHandler.$inject = [ 'modeling' ];


SpaceToolHandler.prototype.preExecute = function(context) {

  // resize
  var modeling = this._modeling,
      resizingShapes = context.resizingShapes,
      delta = context.delta,
      direction = context.direction;

  forEach(resizingShapes, function(shape) {
    var newBounds = resizeBounds(shape, direction, delta);

    modeling.resizeShape(shape, newBounds);
  });
};

SpaceToolHandler.prototype.postExecute = function(context) {
  // move
  var modeling = this._modeling,
      movingShapes = context.movingShapes,
      delta = context.delta;

  modeling.moveElements(movingShapes, delta, undefined, { autoResize: false, attach: false });
};

SpaceToolHandler.prototype.execute = function(context) {};
SpaceToolHandler.prototype.revert = function(context) {};
