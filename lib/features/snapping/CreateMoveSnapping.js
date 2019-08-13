import SnapContext from './SnapContext';

import {
  getChildren,
  isSnapped,
  mid
} from './SnapUtil';

import { isCmd } from '../keyboard/KeyboardUtil';

import {
  forEach,
  isNumber
} from 'min-dash';

var HIGHER_PRIORITY = 1250;


/**
 * Snap during create and move.
 *
 * @param {EventBus} elementRegistry
 * @param {EventBus} eventBus
 * @param {Snapping} snapping
 */
export default function CreateMoveSnapping(elementRegistry, eventBus, snapping) {
  var self = this;

  this._elementRegistry = elementRegistry;

  eventBus.on([
    'create.start',
    'shape.move.start'
  ], function(event) {
    self.initSnap(event);
  });

  eventBus.on([
    'create.move',
    'create.end',
    'shape.move.move',
    'shape.move.end'
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        shape = context.shape,
        snapContext = context.snapContext,
        target = context.target;

    if (event.originalEvent && isCmd(event.originalEvent)) {
      return;
    }

    if (isSnapped(event) || !target) {
      return;
    }

    var snapPoints = snapContext.pointsForTarget(target);

    if (!snapPoints.initialized) {
      snapPoints = self.addSnapTargetPoints(snapPoints, shape, target);

      snapPoints.initialized = true;
    }

    snapping.snap(event, snapPoints);
  });

  eventBus.on([
    'create.cleanup',
    'shape.move.cleanup'
  ], function() {
    snapping.hide();
  });
}

CreateMoveSnapping.$inject = [
  'elementRegistry',
  'eventBus',
  'snapping'
];

CreateMoveSnapping.prototype.initSnap = function(event) {
  var elementRegistry = this._elementRegistry;

  var context = event.context,
      shape = context.shape,
      snapContext = context.snapContext;

  if (!snapContext) {
    snapContext = context.snapContext = new SnapContext();
  }

  var shapeMid;

  if (elementRegistry.get(shape.id)) {

    // move
    shapeMid = mid(shape, event);
  } else {

    // create
    shapeMid = {
      x: event.x + mid(shape).x,
      y: event.y + mid(shape).y
    };
  }

  var shapeTopLeft = {
        x: shapeMid.x - shape.width / 2,
        y: shapeMid.y - shape.height / 2
      },
      shapeBottomRight = {
        x: shapeMid.x + shape.width / 2,
        y: shapeMid.y + shape.height / 2
      };

  snapContext.setSnapOrigin('mid', {
    x: shapeMid.x - event.x,
    y: shapeMid.y - event.y
  });

  // snap labels to mid only
  if (isLabel(shape)) {
    return snapContext;
  }

  snapContext.setSnapOrigin('top-left', {
    x: shapeTopLeft.x - event.x,
    y: shapeTopLeft.y - event.y
  });

  snapContext.setSnapOrigin('bottom-right', {
    x: shapeBottomRight.x - event.x,
    y: shapeBottomRight.y - event.y
  });

  return snapContext;
};

CreateMoveSnapping.prototype.addSnapTargetPoints = function(snapPoints, shape, target) {
  var snapTargets = this.getSnapTargets(shape, target);

  forEach(snapTargets, function(snapTarget) {

    // handle labels
    if (isLabel(snapTarget)) {

      if (isLabel(shape)) {
        snapPoints.add('mid', mid(snapTarget));
      }

      return;
    }

    // handle connections
    if (isConnection(snapTarget)) {

      // ignore single segment connections
      if (snapTarget.waypoints.length < 3) {
        return;
      }

      // ignore first and last waypoint
      var waypoints = snapTarget.waypoints.slice(1, -1);

      forEach(waypoints, function(waypoint) {
        snapPoints.add('mid', waypoint);
      });

      return;
    }

    // handle shapes
    snapPoints.add('mid', mid(snapTarget));
  });

  if (!isNumber(shape.x) || !isNumber(shape.y)) {
    return snapPoints;
  }

  // snap to original position when moving
  if (this._elementRegistry.get(shape.id)) {
    snapPoints.add('mid', mid(shape));
  }

  return snapPoints;
};

CreateMoveSnapping.prototype.getSnapTargets = function(shape, target) {
  return getChildren(target).filter(function(child) {
    return !isHidden(child);
  });
};

// helpers //////////

function isConnection(element) {
  return !!element.waypoints;
}

function isHidden(element) {
  return !!element.hidden;
}

function isLabel(element) {
  return !!element.labelTarget;
}