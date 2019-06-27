import {
  mid
} from './SnapUtil';
import {
  getOrientation,
  getElementLineIntersection
} from '../../layout/LayoutUtil';

var HIGH_PRIORITY = 2000;

var ORIENTATION_PADDING = 2;


/**
 * Snap connection event to target center if outside of the target
 *
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 */
export default function ConnectionSnapping(eventBus, graphicsFactory) {

  this._graphicsFactory = graphicsFactory;

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
        self.snapToIntersection(event, target, orientation);
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
        self.snapToIntersection(event, target, orientation);
      }
    }
  });
}

ConnectionSnapping.$inject = [
  'eventBus',
  'graphicsFactory'
];

ConnectionSnapping.prototype.snapToIntersection = function(event, target, orientation) {
  var gf = this._graphicsFactory;

  var path = gf.getConnectionPath({ waypoints: [ event, mid(target) ] }),
      shapePath = gf.getShapePath(target);

  var intersection = getElementLineIntersection(shapePath, path, true),
      eventPosition = { x: event.x, y: event.y },
      delta;

  if (!intersection) {
    return;
  }

  console.log(intersection);

  [ 'x', 'y' ].forEach(function(axis) {
    var reference = project(eventPosition, target, axis) || intersection[axis];

    console.log(axis, ': ', reference);

    delta = reference - eventPosition[axis];

    event[axis] += delta;
    event['d' + axis] += delta;
  });


  /**
   * Project point on a shape on provided axis.
   *
   * @param {Point} point
   * @param {Shape} shape
   * @param {'x'|'y'} axis
   */
  function project(point, shape, axis) {
    var reference = mid(shape),
        perpendicularAxis = axis === 'x' ? 'y' : 'x';

    reference[perpendicularAxis] = point[perpendicularAxis];

    var path = gf.getConnectionPath({ waypoints: [ point, reference ] }),
        shapePath = gf.getShapePath(shape),
        intersection = getElementLineIntersection(shapePath, path, true);

    return intersection && intersection[axis];
  }
};
