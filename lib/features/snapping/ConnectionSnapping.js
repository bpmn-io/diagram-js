import {
  mid,
  setSnapped
} from './SnapUtil';
import {
  asTRBL,
  getOrientation,
  getElementLineIntersection
} from '../../layout/LayoutUtil';

var HIGH_PRIORITY = 2000;

var ORIENTATION_PADDING = 0;


/**
 * Snap connection event to target center if outside of the target
 *
 * @param {EventBus} eventBus
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

      orientation = getOrientation(event, target, window.ORIENTATION_PADDING);

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


      orientation = getOrientation(event, target, window.ORIENTATION_PADDING);

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

ConnectionSnapping.prototype.snapToCenter = function(event, target) {
  var targetMid = mid(target);

  setSnapped(event, 'x', targetMid.x);
  setSnapped(event, 'y', targetMid.y);
};

ConnectionSnapping.prototype.snapToIntersection = function(event, target, orientation) {
  var ADJUSTMENT = 10;

  var delta;

  var trbl = asTRBL(target);
  var adjustments = orientation.split('-');

  adjustments.forEach(function(adjustment) {
    switch (adjustment) {
    case 'top':
      delta = Math.abs(trbl[adjustment] - event.y) + ADJUSTMENT;
      event.y += delta;
      event.dy += delta;
      break;
    case 'bottom':
      delta = Math.abs(trbl[adjustment] - event.y) + ADJUSTMENT;
      event.y -= delta;
      event.dy -= delta;
      break;
    case 'left':
      delta = Math.abs(trbl[adjustment] - event.x) + ADJUSTMENT;
      event.x += delta;
      event.dx += delta;
      break;
    case 'right':
      delta = Math.abs(trbl[adjustment] - event.x) + ADJUSTMENT;
      event.x -= delta;
      event.dx -= delta;
      break;
    }
  });

  // [ 'x', 'y' ].forEach(function(axis) {
  //   delta = intersection[axis] - event[axis];

  //   delta += delta > 0 ? 1 : delta < 0 ? -1 : 0;

  //   event[axis] += delta;
  //   event['d' + axis] += delta;
  // });
};
