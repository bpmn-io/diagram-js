import {
  assign
} from 'min-dash';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 *
 * @typedef {import('../../core/Types').ShapeLike} Shape
 */

var round = Math.round;

/**
 * Service that allows replacing of elements.
 *
 * @param {Modeling} modeling
 * @param {EventBus} eventBus
 */
export default function Replace(modeling, eventBus) {
  this._modeling = modeling;
  this._eventBus = eventBus;
}

Replace.$inject = [ 'modeling', 'eventBus' ];

/**
 * Replace an element.
 *
 * @param {Shape} oldElement The element to be replaced.
 * @param {Object} attrs Containing information about the new element, for
 * example the new bounds and type.
 * @param {Object} hints Custom hints that will be attached to the context. It
 * can be used to inject data that is needed in the command chain. For example
 * it could be used in eventbus.on('commandStack.shape.replace.postExecute') to
 * change shape attributes after shape creation.
 *
 * @return {Shape}
 */
Replace.prototype.replaceElement = function(oldElement, attrs, hints) {

  if (oldElement.waypoints) {

    // TODO(nikku): we do not replace connections, yet
    return null;
  }

  var modeling = this._modeling;
  var eventBus = this._eventBus;

  eventBus.fire('replace.start', {
    element: oldElement,
    attrs,
    hints
  });

  var width = attrs.width || oldElement.width,
      height = attrs.height || oldElement.height,
      x = attrs.x || oldElement.x,
      y = attrs.y || oldElement.y,
      centerX = round(x + width / 2),
      centerY = round(y + height / 2);

  // modeling API requires center coordinates,
  // account for that when handling shape bounds

  var newElement = modeling.replaceShape(
    oldElement,
    assign(
      {},
      attrs,
      {
        x: centerX,
        y: centerY,
        width: width,
        height: height
      }
    ),
    hints
  );

  eventBus.fire('replace.end', {
    element: oldElement,
    newElement,
    hints
  });

  return newElement;
};
