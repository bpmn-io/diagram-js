var MARKER_OK = 'drop-ok',
    MARKER_NOT_OK = 'drop-not-ok',
    MARKER_ATTACH = 'attach-ok',
    MARKER_NEW_PARENT = 'new-parent';

import {
  assign,
  filter,
  find,
  forEach,
  isArray,
  isNumber,
  map
} from 'min-dash';

import { getBBox } from '../../util/Elements';


/**
 * Create new elements through drag and drop.
 *
 * @param {Canvas} canvas
 * @param {Dragging} dragging
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {Rules} rules
 */
export default function Create(
    canvas,
    dragging,
    eventBus,
    modeling,
    rules
) {

  // rules //////////

  /**
   * Check wether elements can be created.
   *
   * @param {Array<djs.model.Base>} elements
   * @param {djs.model.Base} target
   * @param {Point} position
   * @param {djs.model.Base} [source]
   *
   * @returns {boolean|Object|null}
   */
  function canCreate(elements, target, position, source) {
    if (!target) {
      return false;
    }

    // ignore child elements
    elements = filter(elements, function(element) {
      return !element.parent;
    });

    var shape = find(elements, function(element) {
      return !isConnection(element);
    });

    var attach = false,
        connect = false,
        create = false;

    // (1) attaching single shapes
    if (isSingleShape(elements)) {
      attach = rules.allowed('shape.attach', {
        position: position,
        shape: shape,
        target: target
      });
    }

    if (!attach) {

      // (2) creating elements
      if (isSingleShape(elements)) {
        create = rules.allowed('shape.create', {
          position: position,
          shape: shape,
          source: source,
          target: target
        });
      } else {
        create = rules.allowed('elements.create', {
          elements: elements,
          position: position,
          target: target
        });
      }

    }

    // (3) appending single shapes
    if (create || attach) {

      if (shape && source) {
        connect = rules.allowed('connection.create', {
          source: source,
          target: shape,
          hints: {
            targetParent: target,
            targetAttach: attach
          }
        });
      }

      return {
        attach: attach,
        connect: connect
      };
    }

    // ignore wether or not elements can be created
    if (create === null || attach === null) {
      return null;
    }

    return false;
  }

  function setMarker(element, marker) {
    [ MARKER_ATTACH, MARKER_OK, MARKER_NOT_OK, MARKER_NEW_PARENT ].forEach(function(m) {

      if (m === marker) {
        canvas.addMarker(element, m);
      } else {
        canvas.removeMarker(element, m);
      }
    });
  }

  // event handling //////////

  eventBus.on([ 'create.move', 'create.hover' ], function(event) {
    var context = event.context,
        elements = context.elements,
        hover = event.hover,
        source = context.source;

    if (!hover) {
      context.canExecute = false;
      context.target = null;

      return;
    }

    ensureConstraints(event);

    var position = {
      x: event.x,
      y: event.y
    };

    var canExecute = context.canExecute = hover && canCreate(elements, hover, position, source);

    if (hover && canExecute !== null) {
      context.target = hover;

      if (canExecute && canExecute.attach) {
        setMarker(hover, MARKER_ATTACH);
      } else {
        setMarker(hover, canExecute ? MARKER_NEW_PARENT : MARKER_NOT_OK);
      }
    }
  });

  eventBus.on([ 'create.end', 'create.out', 'create.cleanup' ], function(event) {
    var hover = event.hover;

    if (hover) {
      setMarker(hover, null);
    }
  });

  eventBus.on('create.end', function(event) {
    var context = event.context,
        source = context.source,
        shape = context.shape,
        elements = context.elements,
        target = context.target,
        hints = context.hints,
        canExecute = context.canExecute,
        attach = canExecute && canExecute.attach,
        connect = canExecute && canExecute.connect;

    if (canExecute === false || !target) {
      return false;
    }

    ensureConstraints(event);

    var position = {
      x: event.x,
      y: event.y
    };

    if (connect) {
      shape = modeling.appendShape(source, shape, position, target, {
        attach: attach,
        connection: connect === true ? {} : connect
      });
    } else {
      elements = modeling.createElements(elements, position, target, assign({}, hints, {
        attach: attach
      }));

      // update shape
      shape = find(elements, function(element) {
        return !isConnection(element);
      });
    }

    // update elements and shape
    assign(context, {
      elements: elements,
      shape: shape
    });

    assign(event, {
      elements: elements,
      shape: shape
    });
  });

  // API //////////

  this.start = function(event, elements, context) {
    if (!isArray(elements)) {
      elements = [ elements ];
    }

    var shape = find(elements, function(element) {
      return !isConnection(element);
    });

    if (!shape) {

      // at least one shape is required
      return;
    }

    context = assign({
      elements: elements,
      hints: {},
      shape: shape
    }, context || {});

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

    // center elements around cursor
    forEach(elements, function(element) {
      if (isConnection(element)) {
        element.waypoints = map(element.waypoints, function(waypoint) {
          return {
            x: waypoint.x - bbox.x - bbox.width / 2,
            y: waypoint.y - bbox.y - bbox.height / 2
          };
        });
      }

      assign(element, {
        x: element.x - bbox.x - bbox.width / 2,
        y: element.y - bbox.y - bbox.height / 2
      });
    });

    dragging.init(event, 'create', {
      cursor: 'grabbing',
      autoActivate: true,
      data: {
        shape: shape,
        elements: elements,
        context: context
      }
    });
  };
}

Create.$inject = [
  'canvas',
  'dragging',
  'eventBus',
  'modeling',
  'rules'
];

// helpers //////////

function ensureConstraints(event) {
  var context = event.context,
      createConstraints = context.createConstraints;

  if (!createConstraints) {
    return;
  }

  if (createConstraints.left) {
    event.x = Math.max(event.x, createConstraints.left);
  }

  if (createConstraints.right) {
    event.x = Math.min(event.x, createConstraints.right);
  }

  if (createConstraints.top) {
    event.y = Math.max(event.y, createConstraints.top);
  }

  if (createConstraints.bottom) {
    event.y = Math.min(event.y, createConstraints.bottom);
  }
}

function isConnection(element) {
  return !!element.waypoints;
}

function isSingleShape(elements) {
  return elements && elements.length === 1 && !isConnection(elements[0]);
}