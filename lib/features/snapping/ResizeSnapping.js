import SnapContext from './SnapContext';

import {
  bottomRight,
  getChildren,
  isSnapped,
  setSnapped,
  topLeft,
} from './SnapUtil';

import { isCmd } from '../keyboard/KeyboardUtil';

import {
  asTRBL,
  getMid
} from '../../layout/LayoutUtil';

import { forEach } from 'min-dash';

import {
  isConnection,
  isLabel
} from '../../util/ModelUtil';

/**
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('./Snapping').default} Snapping
 */

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

    if (isHorizontal(direction)) {
      setSnapped(event, 'x', event.x);
    }

    if (isVertical(direction)) {
      setSnapped(event, 'y', event.y);
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

  var snapOrigin = getSnapOrigin(shape, direction);

  snapContext.setSnapOrigin('corner', {
    x: snapOrigin.x - event.x,
    y: snapOrigin.y - event.y
  });

  return snapContext;
};

ResizeSnapping.prototype.addSnapTargetPoints = function(snapPoints, shape, target, direction) {
  var snapTargets = this.getSnapTargets(shape, target);

  forEach(snapTargets, function(snapTarget) {
    snapPoints.add('corner', bottomRight(snapTarget));
    snapPoints.add('corner', topLeft(snapTarget));
  });

  snapPoints.add('corner', getSnapOrigin(shape, direction));

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

function getSnapOrigin(shape, direction) {
  var mid = getMid(shape),
      trbl = asTRBL(shape);

  var snapOrigin = {
    x: mid.x,
    y: mid.y
  };

  if (direction.indexOf('n') !== -1) {
    snapOrigin.y = trbl.top;
  } else if (direction.indexOf('s') !== -1) {
    snapOrigin.y = trbl.bottom;
  }

  if (direction.indexOf('e') !== -1) {
    snapOrigin.x = trbl.right;
  } else if (direction.indexOf('w') !== -1) {
    snapOrigin.x = trbl.left;
  }

  return snapOrigin;
}

function isAttached(element, host) {
  return element.host === host;
}

function isHidden(element) {
  return !!element.hidden;
}

function isHorizontal(direction) {
  return direction === 'n' || direction === 's';
}

function isVertical(direction) {
  return direction === 'e' || direction === 'w';
}