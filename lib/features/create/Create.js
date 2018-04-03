var LOW_PRIORITY = 750;

var MARKER_OK = 'drop-ok',
    MARKER_NOT_OK = 'drop-not-ok',
    MARKER_ATTACH = 'attach-ok',
    MARKER_NEW_PARENT = 'new-parent';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  translate
} from '../../util/SvgTransformUtil';


/**
 * Adds the ability to create new shapes via drag and drop.
 *
 * Create must be activated via {@link Create#start}. From that
 * point on, create will invoke `shape.create` and `shape.attach`
 * rules to query whether or not creation or attachment on a certain
 * position is allowed.
 *
 * If create or attach is allowed and a source is given, Create it
 * will invoke `connection.create` rules to query whether a connection
 * can be drawn between source and new shape. During rule evaluation
 * the target is not attached yet, however
 *
 *   hints = { targetParent, targetAttach }
 *
 * are passed to the evaluating rules.
 *
 *
 * ## Rule Return Values
 *
 * Return values interpreted from  `shape.create`:
 *
 *   * `true`: create is allowed
 *   * `false`: create is disallowed
 *   * `null`: create is not allowed but should be ignored visually
 *
 * Return values interpreted from `shape.attach`:
 *
 *   * `true`: attach is allowed
 *   * `Any`: attach is allowed with the constraints
 *   * `false`: attach is disallowed
 *
 * Return values interpreted from `connection.create`:
 *
 *   * `true`: connection can be created
 *   * `Any`: connection with the given attributes can be created
 *   * `false`: connection can't be created
 *
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {Rules} rules
 * @param {Modeling} modeling
 * @param {Canvas} canvas
 * @param {Styles} styles
 * @param {GraphicsFactory} graphicsFactory
 */
export default function Create(
    eventBus, dragging, rules, modeling,
    canvas, styles, graphicsFactory) {

  // rules

  function canCreate(shape, target, source, position) {

    if (!target) {
      return false;
    }

    var ctx = {
      source: source,
      shape: shape,
      target: target,
      position: position
    };

    var create,
        attach,
        connect;

    attach = rules.allowed('shape.attach', ctx);

    if (!attach) {
      create = rules.allowed('shape.create', ctx);
    }

    if (create || attach) {

      connect = source && rules.allowed('connection.create', {
        source: source,
        target: shape,
        hints: {
          targetParent: target,
          targetAttach: attach
        }
      });
    }

    if (create || attach) {
      return {
        attach: attach,
        connect: connect
      };
    }

    return false;
  }


  /** set drop marker on an element */
  function setMarker(element, marker) {

    [ MARKER_ATTACH, MARKER_OK, MARKER_NOT_OK, MARKER_NEW_PARENT ].forEach(function(m) {

      if (m === marker) {
        canvas.addMarker(element, m);
      } else {
        canvas.removeMarker(element, m);
      }
    });
  }


  // visual helpers

  function createVisual(shape) {
    var group, preview, visual;

    group = svgCreate('g');
    svgAttr(group, styles.cls('djs-drag-group', [ 'no-events' ]));

    svgAppend(canvas.getDefaultLayer(), group);

    preview = svgCreate('g');
    svgClasses(preview).add('djs-dragger');

    svgAppend(group, preview);

    translate(preview, shape.width / -2, shape.height / -2);

    var visualGroup = svgCreate('g');
    svgClasses(visualGroup).add('djs-visual');

    svgAppend(preview, visualGroup);

    visual = visualGroup;

    // hijack renderer to draw preview
    graphicsFactory.drawShape(visual, shape);

    return group;
  }


  // event handlers

  eventBus.on('create.move', function(event) {

    var context = event.context,
        hover = event.hover,
        shape = context.shape,
        source = context.source,
        canExecute;

    var position = {
      x: event.x,
      y: event.y
    };

    canExecute = context.canExecute = hover && canCreate(shape, hover, source, position);

    // ignore hover visually if canExecute is null
    if (hover && canExecute !== null) {
      context.target = hover;

      if (canExecute && canExecute.attach) {
        setMarker(hover, MARKER_ATTACH);
      } else {
        setMarker(hover, canExecute ? MARKER_NEW_PARENT : MARKER_NOT_OK);
      }
    }
  });

  eventBus.on('create.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        shape = context.shape,
        visual = context.visual;

    // lazy init drag visual once we received the first real
    // drag move event (this allows us to get the proper canvas local coordinates)
    if (!visual) {
      visual = context.visual = createVisual(shape);
    }

    translate(visual, event.x, event.y);
  });


  eventBus.on([ 'create.end', 'create.out', 'create.cleanup' ], function(event) {
    var context = event.context,
        target = context.target;

    if (target) {
      setMarker(target, null);
    }
  });

  eventBus.on('create.end', function(event) {
    var context = event.context,
        source = context.source,
        shape = context.shape,
        target = context.target,
        canExecute = context.canExecute,
        attach = canExecute && canExecute.attach,
        connect = canExecute && canExecute.connect,
        position = {
          x: event.x,
          y: event.y
        };

    if (!canExecute) {
      return false;
    }

    if (connect) {
      // invoke append if connect is set via rules
      shape = modeling.appendShape(source, shape, position, target, {
        attach: attach,
        connection: connect === true ? {} : connect
      });
    } else {
      // invoke create, if connect is not set
      shape = modeling.createShape(shape, position, target, {
        attach: attach
      });
    }

    // make sure we provide the actual attached
    // shape with the context so that selection and
    // other components can use it right after the create
    // operation ends
    context.shape = shape;
  });


  eventBus.on('create.cleanup', function(event) {
    var context = event.context;

    if (context.visual) {
      svgRemove(context.visual);
    }
  });

  // API

  this.start = function(event, shape, source) {

    dragging.init(event, 'create', {
      cursor: 'grabbing',
      autoActivate: true,
      data: {
        shape: shape,
        context: {
          shape: shape,
          source: source
        }
      }
    });
  };
}

Create.$inject = [
  'eventBus',
  'dragging',
  'rules',
  'modeling',
  'canvas',
  'styles',
  'graphicsFactory'
];