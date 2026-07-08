import { debounce } from 'min-dash';

import { getBBox } from '../../util/Elements.js';
import { asTRBL } from '../../layout/LayoutUtil.js';

var UPDATE_DEBOUNCE_INTERVAL = 300;

/**
 * Keeps the current selection visible when the canvas container is resized,
 * provided the selection was already visible before the resize. If the selection
 * was out of view, this is a no-op.
 *
 * @param {import('../../core/EventBus').default} eventBus
 * @param {import('../../core/Canvas').default} canvas
 * @param {import('../selection/Selection').default} selection
 */
export default function KeepSelectionVisible(eventBus, canvas, selection) {

  this._selectionWasVisible = false;

  // canvas viewbox computation used to determine selection visibility
  // is a potentially expensive activity. Hence we debounce it to prevent
  // unnecessary computation. The side-effect is that this happens outside
  // of the current update cycle - a good thing.
  const updateSelectionVisible = debounce(() => {
    this._selectionWasVisible = isSelectionVisible();
  }, UPDATE_DEBOUNCE_INTERVAL);

  eventBus.on('canvas.viewbox.changed', updateSelectionVisible);
  eventBus.on('selection.changed', updateSelectionVisible);

  eventBus.on('canvas.resized', () => {
    var selected = selection.get();

    if (!selected.length) {
      return;
    }

    if (!this._selectionWasVisible) {
      return;
    }

    if (isSelectionVisible()) {
      return;
    }

    var currentRoot = canvas.getRootElement();

    // we ensure that selection scrolling always happens on the current root
    // (no root switch happens)
    canvas.scrollToElement(selected.concat(currentRoot));
  });

  function isSelectionVisible() {
    var selected = selection.get();

    if (!selected.length) {
      return false;
    }

    var selectionBBox = getBBox(selected);
    var viewbox = canvas.viewbox();

    var elementTrbl = asTRBL(selectionBBox);
    var viewboxTrbl = asTRBL(viewbox);

    return elementTrbl.left >= viewboxTrbl.left &&
           elementTrbl.right <= viewboxTrbl.right &&
           elementTrbl.top >= viewboxTrbl.top &&
           elementTrbl.bottom <= viewboxTrbl.bottom;
  }

  // @ts-ignore - test helper - flush internal state
  this._flush = updateSelectionVisible.flush;
}

KeepSelectionVisible.$inject = [
  'eventBus',
  'canvas',
  'selection'
];
