import { getBBox } from '../../util/Elements.js';
import { asTRBL } from '../../layout/LayoutUtil.js';

var SCROLL_PADDING = 10;

/**
 * Keeps the current selection visible when the canvas container is resized,
 * provided the selection was already visible before the resize. If the selection
 * was out of view, this is a no-op.
 *
 * @param {import('../../core/EventBus').default} eventBus
 * @param {import('../../core/Canvas').default} canvas
 * @param {import('../selection/Selection').default} selection
 */
export default function KeepSelectionVisibleOnResize(eventBus, canvas, selection) {

  this._selectionWasVisible = false;

  eventBus.on('canvas.viewbox.changed', () => {
    this._selectionWasVisible = isSelectionVisible();
  });

  eventBus.on('selection.changed', () => {
    this._selectionWasVisible = isSelectionVisible();
  });

  eventBus.on('canvas.resized', () => {
    var selected = selection.get();

    if (!selected.length) {
      return;
    }

    if (!this._selectionWasVisible) {
      return;
    }

    var currentRoot = canvas.getRootElement();
    var allInCurrentRoot = selected.every(el => findRoot(el) === currentRoot);

    if (!allInCurrentRoot) {

      // selection is not in the current root
      return;
    }

    canvas.scrollToElement(
      { ...getBBox(selected), parent: currentRoot },
      SCROLL_PADDING
    );
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
}

KeepSelectionVisibleOnResize.$inject = [
  'eventBus',
  'canvas',
  'selection'
];

function findRoot(element) {
  while (element.parent) {
    element = element.parent;
  }
  return element;
}
