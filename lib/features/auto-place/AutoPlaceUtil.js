import {
  asTRBL,
  getOrientation,
  getMid
} from '../../layout/LayoutUtil';

import {
  find,
  reduce
} from 'min-dash';

/**
 * @typedef {import('../../model/Types').Connection} Connection
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Shape} Shape
 *
 * @typedef {import('../../util/Types').Point} Point
 */

// padding to detect element placement
var PLACEMENT_DETECTION_PAD = 10;

export var DEFAULT_DISTANCE = 50;

var DEFAULT_MAX_DISTANCE = 250;


/**
 * Get free position starting from given position.
 *
 * @param {Shape} source
 * @param {Shape} element
 * @param {Point} position
 * @param {(element: Element, position: Point, connectedAtPosition: Element) => Element} getNextPosition
 *
 * @return {Point}
 */
export function findFreePosition(source, element, position, getNextPosition) {
  var connectedAtPosition;

  while ((connectedAtPosition = getConnectedAtPosition(source, position, element))) {
    position = getNextPosition(element, position, connectedAtPosition);
  }

  return position;
}

/**
 * Returns function that returns next position.
 *
 * @param {Object} nextPositionDirection
 * @param {Object} [nextPositionDirection.x]
 * @param {Object} [nextPositionDirection.y]
 *
 * @return {(element: Element, previousPosition: Point, connectedAtPosition: Element) => Point}
 */
export function generateGetNextPosition(nextPositionDirection) {
  return function(element, previousPosition, connectedAtPosition) {
    var nextPosition = {
      x: previousPosition.x,
      y: previousPosition.y
    };

    [ 'x', 'y' ].forEach(function(axis) {

      var nextPositionDirectionForAxis = nextPositionDirection[ axis ];

      if (!nextPositionDirectionForAxis) {
        return;
      }

      var dimension = axis === 'x' ? 'width' : 'height';

      var margin = nextPositionDirectionForAxis.margin,
          minDistance = nextPositionDirectionForAxis.minDistance;

      if (margin < 0) {
        nextPosition[ axis ] = Math.min(
          connectedAtPosition[ axis ] + margin - element[ dimension ] / 2,
          previousPosition[ axis ] - minDistance + margin
        );
      } else {
        nextPosition[ axis ] = Math.max(
          connectedAtPosition[ axis ] + connectedAtPosition[ dimension ] + margin + element[ dimension ] / 2,
          previousPosition[ axis ] + minDistance + margin
        );
      }
    });

    return nextPosition;
  };
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
* Assumes left-to-right and top-to-down modeling.
*
* @param {Shape} source
* @param {Object} [hints]
* @param {number} [hints.defaultDistance]
* @param {string} [hints.direction]
* @param {(connection: Connection) => boolean} [hints.filter]
* @param {(connection: Connection) => number} [hints.getWeight]
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
    return connection.source === source ? 1 : -1;
  }

  var defaultDistance = hints.defaultDistance || DEFAULT_DISTANCE,
      direction = hints.direction || 'e',
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
        return asTRBL(a).left - asTRBL(b).right;
      } else if (reference === 'center') {
        return asTRBL(a).left - getMid(b).x;
      } else {
        return asTRBL(a).left - asTRBL(b).left;
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
        return asTRBL(b).left - asTRBL(a).right;
      } else if (reference === 'center') {
        return getMid(b).x - asTRBL(a).right;
      } else {
        return asTRBL(b).right - asTRBL(a).right;
      }
    }
  }

  var sourcesDistances = source.incoming
    .filter(filter)
    .map(function(connection) {
      var weight = getWeight(connection);

      var distance = weight < 0
        ? getDistance(connection.source, source)
        : getDistance(source, connection.source);

      return {
        id: connection.source.id,
        distance: distance,
        weight: weight
      };
    });

  var targetsDistances = source.outgoing
    .filter(filter)
    .map(function(connection) {
      var weight = getWeight(connection);

      var distance = weight > 0
        ? getDistance(source, connection.target)
        : getDistance(connection.target, source);

      return {
        id: connection.target.id,
        distance: distance,
        weight: weight
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
 * @param {Shape} source
 *
 * @return {Shape[]}
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
