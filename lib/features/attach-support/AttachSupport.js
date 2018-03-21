'use strict';

var forEach = require('min-dash').forEach,
    unionBy = require('min-dash').unionBy,
    filter = require('min-dash').filter,
    groupBy = require('min-dash').groupBy,
    map = require('min-dash').map;

var saveClear = require('../../util/Removal').saveClear,
    flatten = require('../../util/Flatten'),
    Collections = require('../../util/Collections');

var getNewAttachShapeDelta = require('../../util/AttachUtil').getNewAttachShapeDelta;

var inherits = require('inherits');

var LOW_PRIORITY = 251,
    HIGH_PRIORITY = 1401;

var CommandInterceptor = require('../../command/CommandInterceptor');


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
 * @param {Rules} rules
 * @param {Modeling} modeling
 */
function AttachSupport(injector, eventBus, rules, modeling) {

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

      if (attacher.label) {
        movePreview.makeDraggable(context, attacher.label, true);
      }
    });
  });


  // move all attachments after the other shapes are done moving
  this.postExecuted('elements.move', function(event) {

    var context = event.context,
        delta = context.delta,
        newParent = context.newParent,
        closure = context.closure,
        enclosedElements = closure.enclosedElements,
        attachers = getAttachers(enclosedElements);

    // ensure we move all attachers with their hosts
    // if they have not been moved already
    forEach(attachers, function(attacher) {
      if (!enclosedElements[attacher.id]) {
        modeling.moveShape(attacher, delta, newParent);

        if (attacher.label) {
          modeling.moveShape(attacher.label, delta, newParent);
        }
      }
    });
  });

  // perform the attaching after shapes are done moving
  this.postExecuted('elements.move', function(e) {

    var context = e.context,
        shapes = context.shapes,
        newHost = context.newHost,
        attachers;

    // we only support attachment / detachment of one element
    if (shapes.length > 1) {
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

    if (!attachers.length) {
      return;
    }

    forEach(attachers, function(attacher) {
      var delta = getNewAttachShapeDelta(attacher, oldBounds, newBounds);

      modeling.moveShape(attacher, delta, attacher.parent);

      if (attacher.label) {
        modeling.moveShape(attacher.label, delta, attacher.label.parent);
      }
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
      Collections.remove(movingShapes, shape);

      if (shape.label) {
        Collections.remove(movingShapes, shape.label);
      }
    });

    context.attachSupportInitialized = true;
  });
}

inherits(AttachSupport, CommandInterceptor);

AttachSupport.$inject = [
  'injector',
  'eventBus',
  'rules',
  'modeling'
];

module.exports = AttachSupport;


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
