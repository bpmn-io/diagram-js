import {
  assign
} from 'min-dash';

import {
  Root
} from '../../model';

var round = Math.round;

/**
 * Service that allow replacing of elements.
 */
export default function Replace(modeling, eventBus) {

  this._modeling = modeling;
  this._eventBus = eventBus;
}

Replace.$inject = [ 'modeling', 'eventBus' ];

/**
 * @param {Element} oldElement - Element to be replaced
 * @param {Object}  newElementData - Containing information about the new element,
 *                                   for example the new bounds and type.
 * @param {Object}  options - Custom options that will be attached to the context. It can be used to inject data
 *                            that is needed in the command chain. For example it could be used in
 *                            eventbus.on('commandStack.shape.replace.postExecute') to change shape attributes after
 *                            shape creation.
 */
Replace.prototype.replaceElement = function(oldElement, newElementData, options) {

  if (oldElement.waypoints) {

    // TODO(nikku): we do not replace connections, yet
    return null;
  }

  var modeling = this._modeling,
      eventBus = this._eventBus;

  if (oldElement instanceof Root) {
    var newRoot = modeling.replaceRoot(
      oldElement,
      newElementData
    );

    eventBus.fire('root.replaced', {
      oldRoot: oldElement,
      newRoot: newRoot
    });

    return newRoot;
  }

  var width = newElementData.width || oldElement.width,
      height = newElementData.height || oldElement.height,
      x = newElementData.x || oldElement.x,
      y = newElementData.y || oldElement.y,
      centerX = round(x + width / 2),
      centerY = round(y + height / 2);

  // modeling API requires center coordinates,
  // account for that when handling shape bounds

  var newShape = modeling.replaceShape(
    oldElement,
    assign(
      {},
      newElementData,
      {
        x: centerX,
        y: centerY,
        width: width,
        height: height
      }
    ),
    options
  );

  eventBus.fire('shape.replaced', {
    oldShape: oldElement,
    newShape: newShape
  });

  return newShape;
};
