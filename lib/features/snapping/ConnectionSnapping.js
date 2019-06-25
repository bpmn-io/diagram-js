import {
  getOrientation
} from '../../layout/LayoutUtil';

var HIGH_PRIORITY = 2000;

var ORIENTATION_PADDING = -10,
    SNAP_PADDING = 10;


/**
 * Snap connection event to target center if outside of the target
 *
 * @param {EventBus} eventBus
 */
export default function ConnectionSnapping(eventBus) {

  var self = this;

  eventBus.on([
    'connect.hover',
    'connect.move',
    'connect.end'
  ], HIGH_PRIORITY, function(event) {

    var context = event.context,
        target = context.target,
        orientation;

    if (context.canExecute && event.hover && target) {

      orientation = getOrientation(event, target, ORIENTATION_PADDING);

      if (orientation !== 'intersect') {
        self.snapInsideTarget(event, target, SNAP_PADDING);
      }
    }

  });

  eventBus.on([
    'bendpoint.move.hover',
    'bendpoint.move.move',
    'bendpoint.move.end'
  ], HIGH_PRIORITY, function(event) {

    var context = event.context,
        target = context.target,
        orientation;

    if (
      event.hover &&
      context.allowed &&
      context.type !== 'connection.updateWaypoints' &&
      target
    ) {


      orientation = getOrientation(event, target, ORIENTATION_PADDING);

      if (orientation !== 'intersect') {
        self.snapInsideTarget(event, target, SNAP_PADDING);
      }
    }
  });
}

ConnectionSnapping.$inject = [
  'eventBus',
  'graphicsFactory'
];

ConnectionSnapping.prototype.snapInsideTarget = function(event, target, padding) {
  [ 'x', 'y' ].forEach(function(axis) {
    var matchingTargetDimension = getDimensionForAxis(axis, target),
        newCoordinate;

    if (event[axis] <= target[axis] + padding) {
      newCoordinate = target[axis] + padding;
    } else if (event[axis] >= target[axis] + matchingTargetDimension - padding) {
      newCoordinate = target[axis] + matchingTargetDimension - padding;
    }

    if (newCoordinate) {
      snapEvent(event, axis, newCoordinate);
    }
  });
};



// helper /////
function getDimensionForAxis(axis, element) {
  return axis === 'x' ? element.width : element.height;
}

function snapEvent(event, axis, value) {
  var delta = value - event[axis];

  event[axis] += delta;
  event['d' + axis] += delta;
}
