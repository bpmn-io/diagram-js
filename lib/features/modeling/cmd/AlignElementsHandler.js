import { forEach, isDefined } from 'min-dash';

/**
 * @typedef {import('../../../core/Canvas').default} Canvas
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * A handler that align elements in a certain way.
 *
 * @param {Modeling} modeling
 * @param {Canvas} canvas
 */
export default function AlignElements(modeling, canvas) {
  this._modeling = modeling;
  this._canvas = canvas;
}

AlignElements.$inject = [ 'modeling', 'canvas' ];


AlignElements.prototype.preExecute = function(context) {
  var modeling = this._modeling;

  var elements = context.elements,
      alignment = context.alignment;


  forEach(elements, function(element) {
    var delta = {
      x: 0,
      y: 0
    };

    if (isDefined(alignment.left)) {
      delta.x = alignment.left - element.x;

    } else if (isDefined(alignment.right)) {
      delta.x = (alignment.right - element.width) - element.x;

    } else if (isDefined(alignment.center)) {
      delta.x = (alignment.center - Math.round(element.width / 2)) - element.x;

    } else if (isDefined(alignment.top)) {
      delta.y = alignment.top - element.y;

    } else if (isDefined(alignment.bottom)) {
      delta.y = (alignment.bottom - element.height) - element.y;

    } else if (isDefined(alignment.middle)) {
      delta.y = (alignment.middle - Math.round(element.height / 2)) - element.y;
    }

    modeling.moveElements([ element ], delta, element.parent);
  });
};

AlignElements.prototype.postExecute = function(context) {

};
