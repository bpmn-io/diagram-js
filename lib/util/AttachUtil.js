import {
  asTRBL,
  getOrientation,
  roundPoint
} from '../layout/LayoutUtil';

import {
  center,
  delta
} from './PositionUtil';

/**
 * @typedef {import('../model/Types').Shape} Shape
 *
 * @typedef {import('../util/Types').Point} Point
 * @typedef {import('../util/Types').Rect} Rect
 */

/**
 * Calculates the absolute point relative to the new element's position.
 *
 * @param {Point} point [absolute]
 * @param {Rect} oldBounds
 * @param {Rect} newBounds
 *
 * @return {Point} point [absolute]
 */
export function getNewAttachPoint(point, oldBounds, newBounds) {
  var oldCenter = center(oldBounds),
      newCenter = center(newBounds),
      oldDelta = delta(point, oldCenter);

  var newDelta = {
    x: oldDelta.x * (newBounds.width / oldBounds.width),
    y: oldDelta.y * (newBounds.height / oldBounds.height)
  };

  return roundPoint({
    x: newCenter.x + newDelta.x,
    y: newCenter.y + newDelta.y
  });
}


/**
 * Calculates the shape's delta relative to a new position
 * of a certain element's bounds.
 *
 * @param {Shape} shape
 * @param {Rect} oldBounds
 * @param {Rect} newBounds
 *
 * @return {Point} delta
 */
export function getNewAttachShapeDelta(shape, oldBounds, newBounds) {
  var shapeCenter = center(shape),
      oldCenter = center(oldBounds),
      newCenter = center(newBounds),
      shapeDelta = delta(shape, shapeCenter),
      oldCenterDelta = delta(shapeCenter, oldCenter),
      stickyPositionDelta = getStickyPositionDelta(shapeCenter, oldBounds, newBounds);

  if (stickyPositionDelta) {
    return stickyPositionDelta;
  }

  var newCenterDelta = {
    x: oldCenterDelta.x * (newBounds.width / oldBounds.width),
    y: oldCenterDelta.y * (newBounds.height / oldBounds.height)
  };

  var newShapeCenter = {
    x: newCenter.x + newCenterDelta.x,
    y: newCenter.y + newCenterDelta.y
  };

  return roundPoint({
    x: newShapeCenter.x + shapeDelta.x - shape.x,
    y: newShapeCenter.y + shapeDelta.y - shape.y
  });
}

function getStickyPositionDelta(oldShapeCenter, oldBounds, newBounds) {
  var oldTRBL = asTRBL(oldBounds),
      newTRBL = asTRBL(newBounds);

  if (isMoved(oldTRBL, newTRBL)) {
    return null;
  }

  var oldOrientation = getOrientation(oldBounds, oldShapeCenter),
      stickyPositionDelta,
      newShapeCenter,
      newOrientation;

  if (oldOrientation === 'top') {
    stickyPositionDelta = {
      x: 0,
      y: newTRBL.bottom - oldTRBL.bottom
    };
  } else if (oldOrientation === 'bottom') {
    stickyPositionDelta = {
      x: 0,
      y: newTRBL.top - oldTRBL.top
    };
  } else if (oldOrientation === 'right') {
    stickyPositionDelta = {
      x: newTRBL.left - oldTRBL.left,
      y: 0
    };
  } else if (oldOrientation === 'left') {
    stickyPositionDelta = {
      x: newTRBL.right - oldTRBL.right,
      y: 0
    };
  } else {

    // fallback to proportional movement for corner-placed attachments
    return null;
  }

  newShapeCenter = {
    x: oldShapeCenter.x + stickyPositionDelta.x,
    y: oldShapeCenter.y + stickyPositionDelta.y
  };

  newOrientation = getOrientation(newBounds, newShapeCenter);

  if (newOrientation !== oldOrientation) {

    // fallback to proportional movement if orientation would otherwise change
    return null;
  }

  return stickyPositionDelta;
}

function isMoved(oldTRBL, newTRBL) {
  return isHorizontallyMoved(oldTRBL, newTRBL) || isVerticallyMoved(oldTRBL, newTRBL);
}

function isHorizontallyMoved(oldTRBL, newTRBL) {
  return oldTRBL.right !== newTRBL.right && oldTRBL.left !== newTRBL.left;
}

function isVerticallyMoved(oldTRBL, newTRBL) {
  return oldTRBL.top !== newTRBL.top && oldTRBL.bottom !== newTRBL.bottom;
}
