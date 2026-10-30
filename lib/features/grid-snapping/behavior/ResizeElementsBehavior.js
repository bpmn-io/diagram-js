import { forEach } from 'min-dash';

import {
  asBounds,
  asTRBL
} from '../../../layout/LayoutUtil.js';

import { isCmd } from '../../keyboard/KeyboardUtil.js';

/**
 * @typedef {import('../../../model/Types.js').Shape} Shape
 *
 * @typedef {import('../../../util/Types.js').Rect} Rect
 *
 * @typedef {import('../../../core/EventBus.js').default} EventBus
 * @typedef {import('../GridSnapping.js').default} GridSnapping
 */

// after scaling, before applying constraints
var SNAP_PRIORITY = 1200;

/**
 * Integrates resizing multiple shapes together with grid snapping:
 * moved edges of resized shapes snap to the grid.
 *
 * @param {EventBus} eventBus
 * @param {GridSnapping} gridSnapping
 */
export default function ResizeElementsBehavior(eventBus, gridSnapping) {
  eventBus.on('elements.resize.move', SNAP_PRIORITY, function(event) {
    var context = event.context,
        originalEvent = event.originalEvent,
        scaledBounds = context.scaledBounds;

    if (!gridSnapping.isActive() || (originalEvent && isCmd(originalEvent))) {
      return;
    }

    forEach(context.elements, function(element) {
      scaledBounds[ element.id ] = snapEdges(element, scaledBounds[ element.id ], gridSnapping);
    });
  });
}

ResizeElementsBehavior.$inject = [
  'eventBus',
  'gridSnapping'
];


// helpers //////////

/**
 * @param {Shape} shape
 * @param {Rect} newBounds
 * @param {GridSnapping} gridSnapping
 *
 * @return {Rect}
 */
function snapEdges(shape, newBounds, gridSnapping) {
  var trbl = asTRBL(shape),
      snappedTrbl = {};

  forEach(asTRBL(newBounds), function(value, edge) {
    snappedTrbl[ edge ] = value === trbl[ edge ] ? value : gridSnapping.snapValue(value);
  });

  return asBounds(snappedTrbl);
}
