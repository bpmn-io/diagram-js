import {
  flatten,
  filter,
  forEach,
  groupBy,
  map,
  unionBy
} from 'min-dash';

import { saveClear } from '../../util/Removal';

import {
  remove as collectionRemove
} from '../../util/Collections';

import { getNewAttachShapeDelta } from '../../util/AttachUtil';

import inherits from 'inherits';

import CommandInterceptor from '../../command/CommandInterceptor';


var LOW_PRIORITY = 251,
    HIGH_PRIORITY = 1401;

var MARKER_ATTACH = 'attach-ok';


/**
 * Adds the notion of attached elements to the modeler.
 *
 * Optionally depends on `diagram-js/lib/features/move` to render
 * the attached elements during move preview.
 *
 * Optionally depends on `diagram-js/lib/features/label-support`
 * to render attached labels during move preview.
 *
 * @param {didi.Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Rules} rules
 * @param {Modeling} modeling
 */
export default function AttachSupport(injector, eventBus, canvas, rules, modeling) {

  CommandInterceptor.call(this, eventBus);

  var movePreview = injector.get('movePreview', false);


  // remove all the attached elements from the shapes to be validated
  // add all the attached shapes to the overall list of moved shapes
  eventBus.on('shape.move.start', HIGH_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes,
        validatedShapes = context.validatedShapes;

    context.shapes = addAttached(shapes);

    context.validatedShapes = removeAttached(validatedShapes);
  });

  // add attachers to the visual's group
  movePreview && eventBus.on('shape.move.start', LOW_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes,
        attachers = getAttachers(shapes);

    forEach(attachers, function(attacher) {
      movePreview.makeDraggable(context, attacher, true);

      forEach(attacher.labels, function(label) {
        movePreview.makeDraggable(context, label, true);
      });
    });
  });

  // add attach-ok marker to current host
  movePreview && eventBus.on('shape.move.start', function(event) {
    var context = event.context,
        shapes = context.shapes;

    if (shapes.length !== 1) {
      return;
    }

    var shape = shapes[0];

    var host = shape.host;

    if (host) {
      canvas.addMarker(host, MARKER_ATTACH);

      eventBus.once([
        'shape.move.out',
        'shape.move.cleanup'
      ], function() {
        canvas.removeMarker(host, MARKER_ATTACH);
      });
    }
  });

  // add all attachers to move closure
  this.preExecuted('elements.move', HIGH_PRIORITY, function(e) {
    var context = e.context,
        closure = context.closure,
        shapes = context.shapes,
        attachers = getAttachers(shapes);

    forEach(attachers, function(attacher) {
      closure.add(attacher, closure.topLevel[attacher.host.id]);
    });
  });

  // perform the attaching after shapes are done moving
  this.postExecuted('elements.move', function(e) {

    var context = e.context,
        shapes = context.shapes,
        newHost = context.newHost,
        attachers;

    // we only support attachment / detachment of one element
    if (shapes.length !== 1) {
      return;
    }

    if (newHost) {

      attachers = shapes;
    } else {

      attachers = filter(shapes, function(s) {
        return !!s.host;
      });
    }

    forEach(attachers, function(attacher) {
      modeling.updateAttachment(attacher, newHost);
    });
  });

  // ensure invalid attachment connections are removed
  this.postExecuted('elements.move', function(e) {

    var shapes = e.context.shapes;

    forEach(shapes, function(shape) {

      forEach(shape.attachers, function(attacher) {

        // remove invalid outgoing connections
        forEach(attacher.outgoing.slice(), function(connection) {
          var allowed = rules.allowed('connection.reconnectStart', {
            connection: connection,
            source: connection.source,
            target: connection.target
          });

          if (!allowed) {
            modeling.removeConnection(connection);
          }
        });

        // remove invalid incoming connections
        forEach(attacher.incoming.slice(), function(connection) {
          var allowed = rules.allowed('connection.reconnectEnd', {
            connection: connection,
            source: connection.source,
            target: connection.target
          });

          if (!allowed) {
            modeling.removeConnection(connection);
          }
        });
      });
    });
  });

  this.postExecute('shape.create', function(e) {
    var context = e.context,
        shape = context.shape,
        host = context.host;

    if (host) {
      modeling.updateAttachment(shape, host);
    }
  });

  // update attachments if the host is replaced
  this.postExecute('shape.replace', function(e) {

    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape;

    // move the attachers to the new host
    saveClear(oldShape.attachers, function(attacher) {
      var allowed = rules.allowed('elements.move', {
        target: newShape,
        shapes: [attacher]
      });

      if (allowed === 'attach') {
        modeling.updateAttachment(attacher, newShape);
      } else {
        modeling.removeShape(attacher);
      }
    });

    // move attachers if new host has different size
    if (newShape.attachers.length) {

      forEach(newShape.attachers, function(attacher) {
        var delta = getNewAttachShapeDelta(attacher, oldShape, newShape);
        modeling.moveShape(attacher, delta, attacher.parent);
      });
    }

  });

  // move shape on host resize
  this.postExecute('shape.resize', function(event) {
    var context = event.context,
        shape = context.shape,
        oldBounds = context.oldBounds,
        newBounds = context.newBounds,
        attachers = shape.attachers;

    forEach(attachers, function(attacher) {
      var delta = getNewAttachShapeDelta(attacher, oldBounds, newBounds);

      modeling.moveShape(attacher, delta, attacher.parent);

      forEach(attacher.labels, function(label) {
        modeling.moveShape(label, delta, label.parent);
      });
    });
  });

  // remove attachments
  this.preExecute('shape.delete', function(event) {

    var shape = event.context.shape;

    saveClear(shape.attachers, function(attacher) {
      modeling.removeShape(attacher);
    });

    if (shape.host) {
      modeling.updateAttachment(shape, null);
    }
  });


  // Prevent attachers and their labels from moving, when the space tool is performed.
  // Otherwise the attachers and their labels would be moved twice.
  eventBus.on('spaceTool.move', function(event) {

    var context = event.context,
        initialized = context.initialized,
        attachSupportInitialized = context.attachSupportInitialized;

    if (!initialized || attachSupportInitialized) {
      return;
    }

    var movingShapes = context.movingShapes;

    // collect attachers whose host is not being moved using the space tool
    var staticAttachers = filter(movingShapes, function(shape) {
      var host = shape.host;

      return host && movingShapes.indexOf(host) === -1;
    });

    // remove attachers that are not going to be moved from moving shapes
    forEach(staticAttachers, function(shape) {
      collectionRemove(movingShapes, shape);

      forEach(shape.labels, function(label) {
        collectionRemove(movingShapes, shape.label);
      });
    });

    context.attachSupportInitialized = true;
  });
}

inherits(AttachSupport, CommandInterceptor);

AttachSupport.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'rules',
  'modeling'
];


/**
 * Return attachers of the given shapes
 *
 * @param {Array<djs.model.Base>} shapes
 * @return {Array<djs.model.Base>}
 */
function getAttachers(shapes) {
  return flatten(map(shapes, function(s) {
    return s.attachers || [];
  }));
}

/**
 * Return a combined list of elements and
 * attachers.
 *
 * @param {Array<djs.model.Base>} elements
 * @return {Array<djs.model.Base>} filtered
 */
function addAttached(elements) {
  var attachers = getAttachers(elements);

  return unionBy('id', elements, attachers);
}

/**
 * Return a filtered list of elements that do not
 * contain attached elements with hosts being part
 * of the selection.
 *
 * @param  {Array<djs.model.Base>} elements
 *
 * @return {Array<djs.model.Base>} filtered
 */
function removeAttached(elements) {

  var ids = groupBy(elements, 'id');

  return filter(elements, function(element) {
    while (element) {

      // host in selection
      if (element.host && ids[element.host.id]) {
        return false;
      }

      element = element.parent;
    }

    return true;
  });
}
