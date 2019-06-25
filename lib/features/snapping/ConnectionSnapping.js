import {
  mid,
  setSnapped
} from './SnapUtil';
import { getOrientation } from '../../layout/LayoutUtil';

var HIGH_PRIORITY = 2000;


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

      orientation = getOrientation(event, target, 0);

      if (orientation !== 'intersect') {
        self.snapToCenter(event, target);
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


      orientation = getOrientation(event, target, 0);

      if (orientation !== 'intersect') {
        self.snapToCenter(event, target);
      }
    }
  });
}

ConnectionSnapping.$inject = [
  'eventBus'
];

ConnectionSnapping.prototype.snapToCenter = function(event, target) {
  var targetMid = mid(target);

  setSnapped(event, 'x', targetMid.x);
  setSnapped(event, 'y', targetMid.y);
};
