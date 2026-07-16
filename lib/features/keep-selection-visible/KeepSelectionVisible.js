import { debounce } from 'min-dash';

import { getBBox } from '../../util/Elements.js';
import { asTRBL } from '../../layout/LayoutUtil.js';

var UPDATE_DEBOUNCE_INTERVAL = 300;

/**
 * Keeps the current selection visible whenever a change may have pushed it
 * out of view, provided the selection was visible before the change. If the
 * selection was out of view, this is a no-op.
 *
 * The behavior reacts to canvas resizing and any element change (move,
 * resize, etc.) out of the box. Additional triggers can hook into it via
 * {@link KeepSelectionVisible#keepVisible}.
 *
 * @param {import('../../core/EventBus').default} eventBus
 * @param {import('../../core/Canvas').default} canvas
 * @param {import('../selection/Selection').default} selection
 * @param {import('didi').Injector} injector
 */
export default function KeepSelectionVisible(eventBus, canvas, selection, injector) {

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

  /**
   * Scrolls the current selection back into view, provided it was visible
   * before the change that triggered this call. If the selection was out
   * of view or is still visible, this is a no-op.
   *
   * Invoke this after any change that may have pushed the selection
   * out of view.
   */
  this.keepVisible = () => {
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
  };

  eventBus.on('canvas.resized', this.keepVisible);

  var dragging = injector.get('dragging', false);

  eventBus.on('elements.changed', (event) => {
    if (dragging && dragging.context()) {
      return;
    }

    var changed = event.elements;
    var selected = selection.get();

    if (!changed.some(element => selected.includes(element))) {
      return;
    }

    this.keepVisible();
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
  'selection',
  'injector'
];
