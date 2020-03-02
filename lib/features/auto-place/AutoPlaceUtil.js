import {
  asTRBL,
  getOrientation
} from '../../layout/LayoutUtil';

import {
  find,
  reduce,
  isObject
} from 'min-dash';

// padding to detect element placement
var PLACEMENT_DETECTION_PAD = 10;

export var DEFAULT_DISTANCE = 50;

var MAX_DISTANCE = 250;

/**
 * Returns a new, position for the given element
 * based on the given element that is not occupied
 * by some element connected to source.
 *
 * Take into account the escapeDirection (where to move
 * on positioning clashes) in the computation.
 *
 * @param {djs.model.Shape} source
 * @param {djs.model.Shape} element
 * @param {Point} position
 * @param {Object} escapeDelta
 *
 * @return {Point}
 */
export function deconflictPosition(source, element, position, escapeDelta) {

  function nextPosition(existingElement) {

    var newPosition = {
      x: position.x,
      y: position.y
    };

    [ 'x', 'y' ].forEach(function(axis) {

      var axisDelta = escapeDelta[axis];

      if (!axisDelta) {
        return;
      }

      var dimension = axis === 'x' ? 'width' : 'height';

      var margin = axisDelta.margin,
          rowSize = axisDelta.rowSize;

      if (margin < 0) {
        newPosition[axis] = Math.min(
          existingElement[axis] + margin - element[dimension] / 2,
          position[axis] - rowSize + margin
        );
      } else {
        newPosition[axis] = Math.max(
          existingTarget[axis] + existingTarget[dimension] + margin + element[dimension] / 2,
          position[axis] + rowSize + margin
        );
      }
    });

    return newPosition;
  }

  var existingTarget;

  // deconflict position until free slot is found
  while ((existingTarget = getConnectedAtPosition(source, position, element))) {
    position = nextPosition(existingTarget);
  }

  return position;
}

/**
 * Return target at given position, if defined.
 *
 * This takes connected elements from host and attachers
 * into account, too.
 */
export function getConnectedAtPosition(source, position, element) {

  var bounds = {
    x: position.x - (element.width / 2),
    y: position.y - (element.height / 2),
    width: element.width,
    height: element.height
  };

  var closure = getAutoPlaceClosure(source, element);

  return find(closure, function(target) {

    if (target === element) {
      return false;
    }

    var orientation = getOrientation(target, bounds, PLACEMENT_DETECTION_PAD);

    return orientation === 'intersect';
  });
}

/**
* Compute best distance between source and target,
* based on existing connections to and from source.
*
* @param {djs.model.Shape} source
* @param {string} axis
* @param {Function} [filter]
* @param {Object} [hints]
* @param {djs.model.Shape} [hints.connectionTarget]
* @param {djs.model.Shape} [hints.maxDistance]
*
* @return {Number} distance
*/
export function getConnectedDistance(source, axis, filter, hints) {
  if (!filter) {
    filter = noneFilter;
  }

  if (isObject(filter)) {
    hints = filter;
    filter = noneFilter;
  }

  if (!hints) {
    hints = {};
  }

  var maxDistance = hints.maxDistance || MAX_DISTANCE;

  var connectionTargetIsSource = hints.connectionTarget === source;

  var sourceTrbl = asTRBL(source);

  function toTargetNode(weight) {

    return function(shape) {
      return {
        shape: shape,
        weight: weight,
        distanceTo: function(shape) {
          var shapeTrbl = asTRBL(shape);

          if (axis === 'x') {
            return shapeTrbl.left - sourceTrbl.right;
          } else {
            return shapeTrbl.top - sourceTrbl.bottom;
          }
        }
      };
    };
  }

  function toSourceNode(weight) {
    return function(shape) {
      return {
        shape: shape,
        weight: weight,
        distanceTo: function(shape) {
          var shapeTrbl = asTRBL(shape);

          if (axis === 'x') {
            return sourceTrbl.left - shapeTrbl.right;
          } else {
            return sourceTrbl.top - shapeTrbl.bottom;
          }
        }
      };
    };
  }

  // we create a list of nodes to take into consideration
  // for calculating the optimal flow node distance
  //
  //   * weight existing target nodes higher than source nodes unless otherwise indicated
  //   * only take into account individual nodes once
  //
  var nodes = reduce([].concat(
    getTargets(source, filter).map(connectionTargetIsSource ? toSourceNode(5) : toTargetNode(5)),
    getSources(source, filter).map(connectionTargetIsSource ? toTargetNode(1) : toSourceNode(1))
  ), function(nodes, node) {

    // filter out shapes connected twice via source or target
    nodes[node.shape.id + '__weight_' + node.weight] = node;

    return nodes;
  }, {});

  // compute distances between source and incoming nodes;
  // group at the same time by distance and expose the
  // favourite distance as { fav: { count, value } }.
  var distancesGrouped = reduce(nodes, function(result, node) {
    var shape = node.shape,
        weight = node.weight,
        distanceTo = node.distanceTo;

    var fav = result.fav,
        currentDistance,
        currentDistanceCount,
        currentDistanceEntry;

    currentDistance = distanceTo(shape);

    // ignore too far away peers
    if (currentDistance < 0 || currentDistance > maxDistance) {
      return result;
    }

    currentDistanceEntry = result[String(currentDistance)] =
      result[String(currentDistance)] || {
        value: currentDistance,
        count: 0
      };

    // inc diff count
    currentDistanceCount = currentDistanceEntry.count += 1 * weight;

    if (!fav || fav.count < currentDistanceCount) {
      result.fav = currentDistanceEntry;
    }

    return result;
  }, { });

  if (distancesGrouped.fav) {
    return distancesGrouped.fav.value;
  } else {
    return hints.defaultDistance || DEFAULT_DISTANCE;
  }
}

/**
 * Returns all connected elements around the given source.
 *
 * This includes:
 *
 *   - connected elements
 *   - host connected elements
 *   - attachers connected elements
 *
 * @param  {djs.model.Shape} source
 * @param  {djs.model.Shape} element
 *
 * @return {Array<djs.model.Shape>}
 */
function getAutoPlaceClosure(source, element) {

  var allConnected = getConnected(source);

  if (source.host) {
    allConnected = allConnected.concat(getConnected(source.host));
  }

  if (source.attachers) {
    allConnected = allConnected.concat(source.attachers.reduce(function(shapes, attacher) {
      return shapes.concat(getConnected(attacher));
    }, []));
  }

  return allConnected;
}

function getConnected(element, connectionFilter) {
  return [].concat(
    getTargets(element, connectionFilter),
    getSources(element, connectionFilter)
  );
}

function getSources(shape, connectionFilter) {
  if (!connectionFilter) {
    connectionFilter = noneFilter;
  }

  return shape.incoming.filter(connectionFilter).map(function(c) {
    return c.source;
  });
}

function getTargets(shape, connectionFilter) {
  if (!connectionFilter) {
    connectionFilter = noneFilter;
  }

  return shape.outgoing.filter(connectionFilter).map(function(c) {
    return c.target;
  });
}

function noneFilter() {
  return true;
}