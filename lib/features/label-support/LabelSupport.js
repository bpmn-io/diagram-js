import {
  forEach,
  filter
} from 'min-dash';

import inherits from 'inherits-browser';

var LOW_PRIORITY = 250,
    HIGH_PRIORITY = 1400;

import {
  add as collectionAdd,
  indexOf as collectionIdx
} from '../../util/Collections';

import { saveClear } from '../../util/Removal';

import CommandInterceptor from '../../command/CommandInterceptor';


/**
 * A handler that makes sure labels are properly moved with
 * their label targets.
 *
 * @param {didi.Injector} injector
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function LabelSupport(injector, eventBus, modeling) {

  CommandInterceptor.call(this, eventBus);

  var movePreview = injector.get('movePreview', false);

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
  movePreview && eventBus.on('shape.move.start', LOW_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes;

    var labels = [];

    forEach(shapes, function(element) {

      forEach(element.labels, function(label) {

        if (!label.hidden && context.shapes.indexOf(label) === -1) {
          labels.push(label);
        }

        if (element.labelTarget) {
          labels.push(element);
        }
      });
    });

    forEach(labels, function(label) {
      movePreview.makeDraggable(context, label, true);
    });

  });

  // add all labels to move closure
  this.preExecuted('elements.move', HIGH_PRIORITY, function(e) {
    var context = e.context,
        closure = context.closure,
        enclosedElements = closure.enclosedElements;

    var enclosedLabels = [];

    // find labels that are not part of
    // move closure yet and add them
    forEach(enclosedElements, function(element) {
      forEach(element.labels, function(label) {

        if (!enclosedElements[label.id]) {
          enclosedLabels.push(label);
        }
      });
    });

    closure.addAll(enclosedLabels);
  });


  this.preExecute([
    'connection.delete',
    'shape.delete'
  ], function(e) {

    var context = e.context,
        element = context.connection || context.shape;

    saveClear(element.labels, function(label) {
      modeling.removeShape(label, { nested: true });
    });
  });


  this.execute('shape.delete', function(e) {

    var context = e.context,
        shape = context.shape,
        labelTarget = shape.labelTarget;

    // unset labelTarget
    if (labelTarget) {
      context.labelTargetIndex = collectionIdx(labelTarget.labels, shape);
      context.labelTarget = labelTarget;

      shape.labelTarget = null;
    }
  });

  this.revert('shape.delete', function(e) {

    var context = e.context,
        shape = context.shape,
        labelTarget = context.labelTarget,
        labelTargetIndex = context.labelTargetIndex;

    // restore labelTarget
    if (labelTarget) {
      collectionAdd(labelTarget.labels, shape, labelTargetIndex);

      shape.labelTarget = labelTarget;
    }
  });

}

inherits(LabelSupport, CommandInterceptor);

LabelSupport.$inject = [
  'injector',
  'eventBus',
  'modeling'
];


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
