import {
  forEach
} from 'min-dash';

import {
  snapTo
} from './SnapUtil';

/**
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef {import('../../util/Types').Axis} Axis
 * @typedef {import('../../util/Types').DirectionTRBL} DirectionTRBL
 * @typedef {import('../../util/Types').Point} Point
 *
 * @typedef {DirectionTRBL & 'mid'} SnapLocation
 */

/**
 * A snap context, containing the (possibly incomplete)
 * mappings of drop targets (to identify the snapping)
 * to computed snap points.
 */
export default function SnapContext() {

  /**
   * @type {Record<string, SnapPoints>}
   */
  this._targets = {};

  /**
   * @type {Record<SnapLocation, Point>}
   */
  this._snapOrigins = {};

  /**
   * @type {SnapLocation[]}
   */
  this._snapLocations = [];

  /**
   * @type {Record<SnapLocation, Point[]>}
   */
  this._defaultSnaps = {};
}

/**
 * Get the snap origin for a given location.
 *
 * @param {SnapLocation} snapLocation
 *
 * @return {Point}
 */
SnapContext.prototype.getSnapOrigin = function(snapLocation) {
  return this._snapOrigins[snapLocation];
};

/**
 * Set the snap origin for a given location.
 *
 * @param {SnapLocation} snapLocation
 * @param {Point} snapOrigin
 */
SnapContext.prototype.setSnapOrigin = function(snapLocation, snapOrigin) {
  this._snapOrigins[snapLocation] = snapOrigin;

  if (this._snapLocations.indexOf(snapLocation) === -1) {
    this._snapLocations.push(snapLocation);
  }
};

/**
 * Add a default snap point.
 *
 * @param {SnapLocation} snapLocation
 * @param {Point} point
 */
SnapContext.prototype.addDefaultSnap = function(snapLocation, point) {

  var snapValues = this._defaultSnaps[snapLocation];

  if (!snapValues) {
    snapValues = this._defaultSnaps[snapLocation] = [];
  }

  snapValues.push(point);
};

/**
 * Get the snap locations for this context.
 *
 * @return {SnapLocation[]}
 */
SnapContext.prototype.getSnapLocations = function() {
  return this._snapLocations;
};

/**
 * Set the snap locations for this context.
 *
 * The order of locations determines precedence.
 *
 * @param {SnapLocation[]} snapLocations
 */
SnapContext.prototype.setSnapLocations = function(snapLocations) {
  this._snapLocations = snapLocations;
};

/**
 * Get snap points for the given target.
 *
 * @param {Element|string} target
 *
 * @return {SnapPoints}
 */
SnapContext.prototype.pointsForTarget = function(target) {

  var targetId = target.id || target;

  var snapPoints = this._targets[targetId];

  if (!snapPoints) {
    snapPoints = this._targets[targetId] = new SnapPoints();
    snapPoints.initDefaults(this._defaultSnaps);
  }

  return snapPoints;
};


/**
 * Add points to snap to.
 */
export function SnapPoints() {

  /**
   * Example:
   *
   * ```javascript
   * {
   *   'top-right': {
   *     x: [ 100, 200, 300 ]
   *     y: [ 100, 200, 300 ]
   *   }
   * }
   * ```
   *
   * @type {Record<string, Record<Axis, number[]>>}
   */
  this._snapValues = {};
}

/**
 * Add a snap point.
 *
 * @param {SnapLocation} snapLocation
 * @param {Point} point
 */
SnapPoints.prototype.add = function(snapLocation, point) {

  var snapValues = this._snapValues[snapLocation];

  if (!snapValues) {
    snapValues = this._snapValues[snapLocation] = { x: [], y: [] };
  }

  if (snapValues.x.indexOf(point.x) === -1) {
    snapValues.x.push(point.x);
  }

  if (snapValues.y.indexOf(point.y) === -1) {
    snapValues.y.push(point.y);
  }
};

/**
 * Snap a point's x or y value.
 *
 * @param {Point} point
 * @param {SnapLocation} snapLocation
 * @param {Axis} axis
 * @param {number} tolerance
 *
 * @return {number}
 */
SnapPoints.prototype.snap = function(point, snapLocation, axis, tolerance) {
  var snappingValues = this._snapValues[snapLocation];

  return snappingValues && snapTo(point[axis], snappingValues[axis], tolerance);
};

/**
 * Initialize default snap points.
 *
 * @param {Record<SnapLocation, Point[]>} defaultSnaps
 */
SnapPoints.prototype.initDefaults = function(defaultSnaps) {

  var self = this;

  forEach(defaultSnaps || {}, function(snapPoints, snapLocation) {
    forEach(snapPoints, function(point) {
      self.add(snapLocation, point);
    });
  });
};