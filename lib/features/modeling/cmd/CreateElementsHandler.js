import {
  assign,
  filter,
  forEach,
  isNumber,
  map,
  omit,
  pick,
  values
} from 'min-dash';

import {
  getBBox,
  getParents
} from '../../../util/Elements';

import {
  isConnection,
  isLabel
} from '../../../util/ModelUtil';

/**
 * @typedef {import('../Modeling').default} Modeling
 */

var round = Math.round;

/**
 * @param {Modeling} modeling
 */
export default function CreateElementsHandler(modeling) {
  this._modeling = modeling;
}

CreateElementsHandler.$inject = [
  'modeling'
];

CreateElementsHandler.prototype.preExecute = function(context) {
  var elements = context.elements,
      parent = context.parent,
      parentIndex = context.parentIndex,
      position = context.position,
      hints = context.hints;

  var modeling = this._modeling;

  // make sure each element has x and y
  forEach(elements, function(element) {
    if (!isNumber(element.x)) {
      element.x = 0;
    }

    if (!isNumber(element.y)) {
      element.y = 0;
    }
  });

  var visibleElements = filter(elements, function(element) {
    return !element.hidden;
  });

  var bbox = getBBox(visibleElements);

  // center elements around position
  forEach(elements, function(element) {
    if (isConnection(element)) {
      element.waypoints = map(element.waypoints, function(waypoint) {
        return {
          x: round(waypoint.x - bbox.x - bbox.width / 2 + position.x),
          y: round(waypoint.y - bbox.y - bbox.height / 2 + position.y)
        };
      });
    }

    assign(element, {
      x: round(element.x - bbox.x - bbox.width / 2 + position.x),
      y: round(element.y - bbox.y - bbox.height / 2 + position.y)
    });
  });

  var parents = getParents(elements);

  var cache = {};

  forEach(elements, function(element) {
    if (isConnection(element)) {
      cache[ element.id ] = isNumber(parentIndex) ?
        modeling.createConnection(
          cache[ element.source.id ],
          cache[ element.target.id ],
          parentIndex,
          element,
          element.parent || parent,
          hints
        ) :
        modeling.createConnection(
          cache[ element.source.id ],
          cache[ element.target.id ],
          element,
          element.parent || parent,
          hints
        );

      return;
    }

    var createShapeHints = assign({}, hints);

    if (parents.indexOf(element) === -1) {
      createShapeHints.autoResize = false;
    }

    if (isLabel(element)) {
      createShapeHints = omit(createShapeHints, [ 'attach' ]);
    }

    cache[ element.id ] = isNumber(parentIndex) ?
      modeling.createShape(
        element,
        pick(element, [ 'x', 'y', 'width', 'height' ]),
        element.parent || parent,
        parentIndex,
        createShapeHints
      ) :
      modeling.createShape(
        element,
        pick(element, [ 'x', 'y', 'width', 'height' ]),
        element.parent || parent,
        createShapeHints
      );
  });

  context.elements = values(cache);
};