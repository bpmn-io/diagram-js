import {
  assign,
  forEach,
  isNumber,
  map,
  pick,
  values
} from 'min-dash';

import {
  getBBox,
  getParents
} from '../../../util/Elements';

var round = Math.round;

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

  var bbox = getBBox(elements);

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

// helpers //////////

function isConnection(element) {
  return !!element.waypoints;
}