import {
  asTRBL,
  getOrientation,
  getMid
} from '../../layout/LayoutUtil';

import {
  find,
  reduce
} from 'min-dash';

// padding to detect element placement
var PLACEMENT_DETECTION_PAD = 10;

export var DEFAULT_DISTANCE = 50;

var DEFAULT_MAX_DISTANCE = 250;


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
* Compute optimal distance between source and target based on existing connections to and from source.
*
* @param {djs.model.Shape} source
* @param {Object} [hints]
* @param {number} [hints.defaultDistance]
* @param {string} [hints.direction]
* @param {Function} [hints.filter]
* @param {Function} [hints.getWeight]
* @param {number} [hints.maxDistance]
* @param {string} [hints.reference]
*
* @return {number}
*/
export function getConnectedDistance(source, hints) {
  if (!hints) {
    hints = {};
  }

  // targets > sources by default
  function getDefaultWeight(connection) {
    return connection.source === source ? 5 : 1;
  }

  var defaultDistance = hints.defaultDistance || DEFAULT_DISTANCE,
      direction = hints.direction || 'w',
      filter = hints.filter,
      getWeight = hints.getWeight || getDefaultWeight,
      maxDistance = hints.maxDistance || DEFAULT_MAX_DISTANCE,
      reference = hints.reference || 'start';

  if (!filter) {
    filter = noneFilter;
  }

  function getDistance(a, b) {
    if (direction === 'n') {
      if (reference === 'start') {
        return asTRBL(a).top - asTRBL(b).bottom;
      } else if (reference === 'center') {
        return asTRBL(a).top - getMid(b).y;
      } else {
        return asTRBL(a).top - asTRBL(b).top;
      }
    } else if (direction === 'w') {
      if (reference === 'start') {
        return asTRBL(b).left - asTRBL(a).right;
      } else if (reference === 'center') {
        return getMid(b).x - asTRBL(a).right;
      } else {
        return asTRBL(b).right - asTRBL(a).right;
      }
    } else if (direction === 's') {
      if (reference === 'start') {
        return asTRBL(b).top - asTRBL(a).bottom;
      } else if (reference === 'center') {
        return getMid(b).y - asTRBL(a).bottom;
      } else {
        return asTRBL(b).bottom - asTRBL(a).bottom;
      }
    } else {
      if (reference === 'start') {
        return asTRBL(a).left - asTRBL(b).right;
      } else if (reference === 'center') {
        return asTRBL(a).left - getMid(b).x;
      } else {
        return asTRBL(a).left - asTRBL(b).left;
      }
    }
  }

  var sourcesDistances = source.incoming
    .filter(filter)
    .map(function(connection) {
      return {
        id: connection.source.id,
        distance: getDistance(source, connection.source),
        weight: getWeight(connection)
      };
    });

  var targetsDistances = source.outgoing
    .filter(filter)
    .map(function(connection) {
      return {
        id: connection.target.id,
        distance: getDistance(source, connection.target),
        weight: getWeight(connection)
      };
    });

  var distances = sourcesDistances.concat(targetsDistances).reduce(function(accumulator, currentValue) {
    accumulator[ currentValue.id + '__weight_' + currentValue.weight ] = currentValue;

    return accumulator;
  }, {});

  var distancesGrouped = reduce(distances, function(accumulator, currentValue) {
    var distance = currentValue.distance,
        weight = currentValue.weight;

    if (distance < 0 || distance > maxDistance) {
      return accumulator;
    }

    if (!accumulator[ String(distance) ]) {
      accumulator[ String(distance) ] = 0;
    }

    accumulator[ String(distance) ] += 1 * weight;

    if (!accumulator.distance || accumulator[ accumulator.distance ] < accumulator[ String(distance) ]) {
      accumulator.distance = distance;
    }

    return accumulator;
  }, {});

  return distancesGrouped.distance || defaultDistance;
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
 *
 * @return {Array<djs.model.Shape>}
 */
function getAutoPlaceClosure(source) {

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

function getConnected(element) {
  return getTargets(element).concat(getSources(element));
}

function getSources(shape) {
  return shape.incoming.map(function(connection) {
    return connection.source;
  });
}

function getTargets(shape) {
  return shape.outgoing.map(function(connection) {
    return connection.target;
  });
}

function noneFilter() {
  return true;
}
