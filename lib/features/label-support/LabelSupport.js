import {
  forEach,
  filter,
  reduce
} from 'min-dash';

import inherits from 'inherits';

var LOW_PRIORITY = 250,
    HIGH_PRIORITY = 1400;

import { getMid } from '../../layout/LayoutUtil';

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

  // fetch all labels to be moved together with their
  // pre-move mid; we'll use this to determine, if a label
  // needs move afterwards
  this.postExecute('elements.move', HIGH_PRIORITY, function(e) {
    var context = e.context,
        closure = context.closure,
        enclosedElements = closure.enclosedElements;

    context.enclosedLabels = reduce(enclosedElements, function(enclosedLabels, element) {
      forEach(element.labels, function(label) {

        if (!enclosedElements[label.id]) {
          enclosedLabels.push([ label, getMid(label) ]);
        }
      });

      return enclosedLabels;
    }, []);
  });

  // move previously fetched labels, if the have not been moved already
  this.postExecuted('elements.move', function(e) {

    var context = e.context,
        labels = context.enclosedLabels,
        delta = context.delta;

    forEach(labels, function(entry) {
      var label = entry[0];
      var mid = entry[1];

      var currentMid = getMid(label);

      // has label not been moved yet?
      if (currentMid.x === mid.x && currentMid.y === mid.y) {
        modeling.moveShape(label, delta, label.labelTarget.parent);
      }
    });
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
