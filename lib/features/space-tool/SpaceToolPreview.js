'use strict';

var forEach = require('min-dash').forEach;

var MARKER_DRAGGING = 'djs-dragging',
    MARKER_RESIZING = 'djs-resizing';

var LOW_PRIORITY = 250;

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgClasses = require('tiny-svg/lib/classes'),
    svgCreate = require('tiny-svg/lib/create'),
    svgRemove = require('tiny-svg/lib/remove');

var translate = require('../../util/SvgTransformUtil').translate;


/**
 * Provides previews for selecting/moving/resizing shapes when creating/removing space.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 * @param {Styles} styles
 */

function SpaceToolPreview(eventBus, elementRegistry, canvas, styles, previewSupport) {

  function addPreviewGfx(collection, dragGroup) {
    forEach(collection, function(element) {
      previewSupport.addDragger(element, dragGroup);

      canvas.addMarker(element, MARKER_DRAGGING);
    });
  }

  // add crosshair
  eventBus.on('spaceTool.selection.start', function(event) {
    var space = canvas.getLayer('space'),
        context = event.context;

    var orientation = {
      x: 'M 0,-10000 L 0,10000',
      y: 'M -10000,0 L 10000,0'
    };

    var crosshairGroup = svgCreate('g');
    svgAttr(crosshairGroup, styles.cls('djs-crosshair-group', [ 'no-events' ]));

    svgAppend(space, crosshairGroup);

    // horizontal path
    var pathX = svgCreate('path');
    svgAttr(pathX, 'd', orientation.x);
    svgClasses(pathX).add('djs-crosshair');

    svgAppend(crosshairGroup, pathX);

    // vertical path
    var pathY = svgCreate('path');
    svgAttr(pathY, 'd', orientation.y);
    svgClasses(pathY).add('djs-crosshair');

    svgAppend(crosshairGroup, pathY);

    context.crosshairGroup = crosshairGroup;
  });

  // update crosshair
  eventBus.on('spaceTool.selection.move', function(event) {
    var crosshairGroup = event.context.crosshairGroup;

    translate(crosshairGroup, event.x, event.y);
  });

  // remove crosshair
  eventBus.on('spaceTool.selection.cleanup', function(event) {
    var context = event.context,
        crosshairGroup = context.crosshairGroup;

    if (crosshairGroup) {
      svgRemove(crosshairGroup);
    }
  });

  // add and update move/resize previews
  eventBus.on('spaceTool.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        line = context.line,
        axis = context.axis,
        movingShapes = context.movingShapes,
        resizingShapes = context.resizingShapes;

    if (!context.initialized) {
      return;
    }

    if (!context.dragGroup) {
      var spaceLayer = canvas.getLayer('space');

      line = svgCreate('path');
      svgAttr(line, 'd', 'M0,0 L0,0');
      svgClasses(line).add('djs-crosshair');

      svgAppend(spaceLayer, line);

      context.line = line;

      var dragGroup = svgCreate('g');
      svgAttr(dragGroup, styles.cls('djs-drag-group', [ 'no-events' ]));

      svgAppend(canvas.getDefaultLayer(), dragGroup);

      // shapes
      addPreviewGfx(movingShapes, dragGroup);

      // connections
      var movingConnections = context.movingConnections = elementRegistry.filter(function(element) {
        var sourceIsMoving = false;

        forEach(movingShapes, function(shape) {
          forEach(shape.outgoing, function(connection) {
            if (element === connection) {
              sourceIsMoving = true;
            }
          });
        });

        var targetIsMoving = false;

        forEach(movingShapes, function(shape) {
          forEach(shape.incoming, function(connection) {
            if (element === connection) {
              targetIsMoving = true;
            }
          });
        });

        var sourceIsResizing = false;

        forEach(resizingShapes, function(shape) {
          forEach(shape.outgoing, function(connection) {
            if (element === connection) {
              sourceIsResizing = true;
            }
          });
        });

        var targetIsResizing = false;

        forEach(resizingShapes, function(shape) {
          forEach(shape.incoming, function(connection) {
            if (element === connection) {
              targetIsResizing = true;
            }
          });
        });

        return isConnection(element)
          && (sourceIsMoving || sourceIsResizing)
          && (targetIsMoving || targetIsResizing);
      });


      addPreviewGfx(movingConnections, dragGroup);

      context.dragGroup = dragGroup;
    }

    if (!context.frameGroup) {
      var frameGroup = svgCreate('g');
      svgAttr(frameGroup, styles.cls('djs-frame-group', [ 'no-events' ]));

      svgAppend(canvas.getDefaultLayer(), frameGroup);

      var frames = [];

      forEach(resizingShapes, function(shape) {
        var frame = previewSupport.addFrame(shape, frameGroup);

        frames.push({
          element: frame,
          initialWidth: frame.getBBox().width,
          initialHeight: frame.getBBox().height
        });

        canvas.addMarker(shape, MARKER_RESIZING);
      });

      context.frameGroup = frameGroup;
      context.frames = frames;
    }

    var orientation = {
      x: 'M' + event.x + ', -10000 L' + event.x + ', 10000',
      y: 'M -10000, ' + event.y + ' L 10000, ' + event.y
    };

    svgAttr(line, { path: orientation[ axis ], display: '' });

    var opposite = { x: 'y', y: 'x' };
    var delta = { x: event.dx, y: event.dy };
    delta[ opposite[ context.axis ] ] = 0;

    // update move previews
    translate(context.dragGroup, delta.x, delta.y);

    // update resize previews
    forEach(context.frames, function(frame) {
      if (frame.initialWidth + delta.x > 5) {
        svgAttr(frame.element, { width: frame.initialWidth + delta.x });
      }

      if (frame.initialHeight + delta.y > 5) {
        svgAttr(frame.element, { height: frame.initialHeight + delta.y });
      }
    });

  });

  // remove move/resize previews
  eventBus.on('spaceTool.cleanup', function(event) {

    var context = event.context,
        movingShapes = context.movingShapes,
        movingConnections = context.movingConnections,
        resizingShapes = context.resizingShapes,
        line = context.line,
        dragGroup = context.dragGroup,
        frameGroup = context.frameGroup;

    // moving shapes
    forEach(movingShapes, function(shape) {
      canvas.removeMarker(shape, MARKER_DRAGGING);
    });

    // moving connections
    forEach(movingConnections, function(connection) {
      canvas.removeMarker(connection, MARKER_DRAGGING);
    });

    if (dragGroup) {
      svgRemove(line);
      svgRemove(dragGroup);
    }

    forEach(resizingShapes, function(shape) {
      canvas.removeMarker(shape, MARKER_RESIZING);
    });

    if (frameGroup) {
      svgRemove(frameGroup);
    }
  });
}

SpaceToolPreview.$inject = [ 'eventBus', 'elementRegistry', 'canvas', 'styles', 'previewSupport' ];

module.exports = SpaceToolPreview;


// helpers //////////////////////

/**
 * Checks if an element is a connection.
 */
function isConnection(element) {
  return element.waypoints;
}
