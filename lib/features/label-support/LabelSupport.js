'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    inherits = require('inherits');

var LOW_PRIORITY = 250,
    HIGH_PRIORITY = 1400;

var saveClear = require('../../util/Removal').saveClear;

var CommandInterceptor = require('../../command/CommandInterceptor');


/**
 * A handler that makes sure labels are properly moved with
 * their label targets.
 */
function LabelSupport(eventBus, modeling, movePreview) {

  CommandInterceptor.call(this, eventBus);

  // remove labels from the collection that are being
  // moved with other elements anyway
  eventBus.on('shape.move.start', HIGH_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes,
        validatedShapes = context.validatedShapes;

    context.shapes = removeLabels(shapes);
    context.validatedShapes = removeLabels(validatedShapes);
  });


  // add labels to visual's group
  eventBus.on('shape.move.start', LOW_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes;

    var labels = [];

    forEach(shapes, function(element) {

      if (element.labels && element.labels.length) {

        var elementLabels = element.labels;

        forEach(elementLabels, function(label) {

          if (label && !label.hidden && context.shapes.indexOf(label) === -1) {
            labels.push(label);
          }

          if (element.labelTarget) {
            labels.push(element);
          }
        });
      }
    });

    forEach(labels, function(label) {
      movePreview.makeDraggable(context, label, true);
    });

  });

  // move labels after the other shapes are done moving
  this.postExecuted([ 'elements.move' ], function(e) {
    var context = e.context,
        closure = context.closure,
        enclosedElements = closure.enclosedElements;

    // ensure we move all labels with their respective elements
    // if they have not been moved already

    forEach(enclosedElements, function(e) {
      if (e.labels && e.labels.length) {

        forEach(e.labels, function(label) {
          if (label && !enclosedElements[label.id]) {
            modeling.moveShape(label, context.delta, e.parent);
          }
        });
      }
    });
  });

  this.preExecute('connection.delete', function(e) {

    var context = e.context,
        connection = context.connection;

    saveClear(connection.labels, function(label) {
      modeling.removeShape(label);
    });
  });

  this.preExecute('shape.delete', function(e) {

    var context = e.context,
        shape = context.shape;

    // remove labels
    saveClear(shape.labels, function(label) {
      modeling.removeShape(label, { nested: true });
    });
  });

  this.execute('shape.delete', function(e) {

    var context = e.context,
        shape = context.shape;

    // unset labelTarget
    if (shape.labelTarget) {
      context.labelTarget = shape.labelTarget;

      shape.labelTarget = null;
    }
  });

  this.revert('shape.delete', function(e) {

    var context = e.context,
        shape = context.shape,
        labelTarget = context.labelTarget;

    // restore labelTarget
    if (labelTarget) {
      shape.labelTarget = labelTarget;
    }
  });

}

inherits(LabelSupport, CommandInterceptor);

LabelSupport.$inject = [ 'eventBus', 'modeling', 'movePreview' ];

module.exports = LabelSupport;


/**
 * Return a filtered list of elements that do not
 * contain attached elements with hosts being part
 * of the selection.
 *
 * @param  {Array<djs.model.Base>} elements
 *
 * @return {Array<djs.model.Base>} filtered
 */
function removeLabels(elements) {

  return filter(elements, function(element) {

    // filter out labels that are move together
    // with their label targets
    return elements.indexOf(element.labelTarget) === -1;
  });
}
