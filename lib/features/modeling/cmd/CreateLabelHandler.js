import inherits from 'inherits-browser';

import CreateShapeHandler from './CreateShapeHandler';

/**
 * @typedef {import('../../../core/Canvas').default} Canvas
 *
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').Parent} Parent
 * @typedef {import('../../../model/Types').Shape} Shape
 * @typedef {import('../../../util/Types').Point} Point
 */

/**
 * A handler that attaches a label to a given target shape.
 *
 * @param {Canvas} canvas
 */
export default function CreateLabelHandler(canvas) {
  CreateShapeHandler.call(this, canvas);
}

inherits(CreateLabelHandler, CreateShapeHandler);

CreateLabelHandler.$inject = [ 'canvas' ];


// api //////////////////////


var originalExecute = CreateShapeHandler.prototype.execute;

/**
 * Append label to element.
 *
 * @param { {
 *   parent: Parent;
 *   position: Point;
 *   shape: Shape;
 *   target: Element;
 * } } context
 */
CreateLabelHandler.prototype.execute = function(context) {

  var label = context.shape;

  ensureValidDimensions(label);

  label.labelTarget = context.labelTarget;

  return originalExecute.call(this, context);
};

var originalRevert = CreateShapeHandler.prototype.revert;

/**
 * Revert appending by removing label.
 */
CreateLabelHandler.prototype.revert = function(context) {
  context.shape.labelTarget = null;

  return originalRevert.call(this, context);
};


// helpers //////////////////////

function ensureValidDimensions(label) {

  // make sure a label has valid { width, height } dimensions
  [ 'width', 'height' ].forEach(function(prop) {
    if (typeof label[prop] === 'undefined') {
      label[prop] = 0;
    }
  });
}