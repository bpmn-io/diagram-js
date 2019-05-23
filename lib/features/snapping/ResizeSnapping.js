import SnapContext from './SnapContext';

import {
  bottomLeft,
  bottomRight,
  getChildren,
  isSnapped,
  topLeft,
  topRight
} from './SnapUtil';

import { isCmd } from '../keyboard/KeyboardUtil';

import { forEach } from 'min-dash';

var HIGHER_PRIORITY = 1250;


/**
 * Snap during resize.
 *
 * @param {EventBus} eventBus
 * @param {Snapping} snapping
 */
export default function ResizeSnapping(eventBus, snapping) {
  var self = this;

  eventBus.on([ 'resize.start' ], function(event) {
    self.initSnap(event);
  });

  eventBus.on([
    'resize.move',
    'resize.end',
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        parent = shape.parent,
        direction = context.direction,
        snapContext = context.snapContext;

    if (event.originalEvent && isCmd(event.originalEvent)) {
      return;
    }

    if (isSnapped(event)) {
      return;
    }

    var snapPoints = snapContext.pointsForTarget(parent);

    if (!snapPoints.initialized) {
      snapPoints = self.addSnapTargetPoints(snapPoints, shape, parent, direction);

      snapPoints.initialized = true;
    }

    snapping.snap(event, snapPoints);
  });

  eventBus.on([ 'resize.cleanup' ], function() {
    snapping.hide();
  });
}

ResizeSnapping.prototype.initSnap = function(event) {
  var context = event.context,
      shape = context.shape,
      direction = context.direction,
      snapContext = context.snapContext;

  if (!snapContext) {
    snapContext = context.snapContext = new SnapContext();
  }

  var snapCorner = getCorner(shape, direction);

  snapContext.setSnapOrigin('corner', {
    x: snapCorner.x - event.x,
    y: snapCorner.y - event.y
  });

  return snapContext;
};

ResizeSnapping.prototype.addSnapTargetPoints = function(snapPoints, shape, target, direction) {
  var snapTargets = this.getSnapTargets(shape, target);

  forEach(snapTargets, function(snapTarget) {
    snapPoints.add('corner', bottomRight(snapTarget));
    snapPoints.add('corner', topLeft(snapTarget));
  });

  snapPoints.add('corner', getCorner(shape, direction));

  return snapPoints;
};

ResizeSnapping.$inject = [
  'eventBus',
  'snapping'
];

ResizeSnapping.prototype.getSnapTargets = function(shape, target) {
  return getChildren(target).filter(function(child) {
    return !isAttached(child, shape)
      && !isConnection(child)
      && !isHidden(child)
      && !isLabel(child);
  });
};

// helpers //////////

function getCorner(shape, direction) {
  if (direction === 'nw') {
    return topLeft(shape);
  } else if (direction === 'ne') {
    return topRight(shape);
  } else if (direction === 'sw') {
    return bottomLeft(shape);
  } else {
    return bottomRight(shape);
  }
}

function isAttached(element, host) {
  return element.host === host;
}

function isConnection(element) {
  return !!element.waypoints;
}

function isHidden(element) {
  return !!element.hidden;
}

function isLabel(element) {
  return !!element.labelTarget;
}