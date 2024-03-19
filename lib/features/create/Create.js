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

import {
  isConnection,
  isLabel
} from '../../util/ModelUtil';

/**
 * @typedef {import('../../core/Types').ElementLike} Element
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../util/Types').Point} Point
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../rules/Rules').default} Rules
 */

var PREFIX = 'create';

var HIGH_PRIORITY = 2000;


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
   * @param {Element[]} elements
   * @param {Shape} target
   * @param {Point} position
   * @param {Element} [source]
   *
   * @return {boolean|null|Object}
   */
  function canCreate(elements, target, position, source, hints) {
    if (!target) {
      return false;
    }

    // ignore child elements and external labels
    elements = filter(elements, function(element) {
      var labelTarget = element.labelTarget;

      return !element.parent && !(isLabel(element) && elements.indexOf(labelTarget) !== -1);
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

    var connectionTarget = hints.connectionTarget;

    // (3) appending single shapes
    if (create || attach) {
      if (shape && source) {
        connect = rules.allowed('connection.create', {
          source: connectionTarget === source ? shape : source,
          target: connectionTarget === source ? source : shape,
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
        source = context.source,
        hints = context.hints || {};

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

    var canExecute = context.canExecute = hover && canCreate(elements, hover, position, source, hints);

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
        canExecute = context.canExecute,
        attach = canExecute && canExecute.attach,
        connect = canExecute && canExecute.connect,
        hints = context.hints || {};

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
        connection: connect === true ? {} : connect,
        connectionTarget: hints.connectionTarget
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

  function cancel() {
    var context = dragging.context();

    if (context && context.prefix === PREFIX) {
      dragging.cancel();
    }
  }

  // cancel on <elements.changed> that is not result of <drag.end>
  eventBus.on('create.init', function() {
    eventBus.on('elements.changed', cancel);

    eventBus.once([ 'create.cancel', 'create.end' ], HIGH_PRIORITY, function() {
      eventBus.off('elements.changed', cancel);
    });
  });

  // API //////////

  /**
   * @param event
   * @param elements
   * @param {any} [context={}]
   */
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

    var visibleElements = filter(elements, function(element) {
      return !element.hidden;
    });

    var bbox = getBBox(visibleElements);

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

    dragging.init(event, PREFIX, {
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

function isSingleShape(elements) {
  return elements && elements.length === 1 && !isConnection(elements[ 0 ]);
}