import {
  mid
} from './SnapUtil';
import {
  getOrientation,
  getElementLineIntersection
} from '../../layout/LayoutUtil';

var HIGH_PRIORITY = 2000;


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

      orientation = getOrientation(event, target);

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


      orientation = getOrientation(event, target);

      if (orientation !== 'intersect') {
        self.snapToIntersection(event, target, orientation);
      }
    }
  });
}

ConnectionSnapping.$inject = [
  'eventBus',
  'graphicsFactory',
  'injector'
];

ConnectionSnapping.prototype.snapToIntersection = function(event, target, orientation) {
  var path = this._graphicsFactory.getConnectionPath({ waypoints: [ event, mid(target) ] }),
      shapePath = this._graphicsFactory.getShapePath(target);

  var intersection = getElementLineIntersection(shapePath, path, true),
      delta;

  if (!intersection) {
    return;
  }

  [ 'x', 'y' ].forEach(function(axis) {
    delta = intersection[axis] - event[axis];

    event[axis] += delta;
    event['d' + axis] += delta;
  });
};
