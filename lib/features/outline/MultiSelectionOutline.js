import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses,
  clear as svgClear
} from 'tiny-svg';

import { assign } from 'min-dash';

import { getBBox } from '../../util/Elements';

var SELECTION_OUTLINE_PADDING = 6;

/**
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../selection/Selection').default} Selection
 * @typedef {import('../../core/Canvas').default} Canvas
 */

/**
 * @class
 *
 * A plugin that adds an outline to shapes and connections that may be activated and styled
 * via CSS classes.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Selection} selection
 */
export default function MultiSelectionOutline(eventBus, canvas, selection) {
  this._canvas = canvas;

  var self = this;

  eventBus.on('element.changed', function(event) {
    if (selection.isSelected(event.element)) {
      self._updateMultiSelectionOutline(selection.get());
    }
  });

  eventBus.on('selection.changed', function(event) {
    var newSelection = event.newSelection;

    self._updateMultiSelectionOutline(newSelection);
  });
}



MultiSelectionOutline.prototype._updateMultiSelectionOutline = function(selection) {
  var layer = this._canvas.getLayer('selectionOutline');

  svgClear(layer);

  var enabled = selection.length > 1;

  var container = this._canvas.getContainer();

  svgClasses(container)[enabled ? 'add' : 'remove']('djs-multi-select');

  if (!enabled) {
    return;
  }

  var bBox = addSelectionOutlinePadding(getBBox(selection));

  var rect = svgCreate('rect');

  svgAttr(rect, assign({
    rx: 3
  }, bBox));

  svgClasses(rect).add('djs-selection-outline');

  svgAppend(layer, rect);
};


MultiSelectionOutline.$inject = [ 'eventBus', 'canvas', 'selection' ];

// helpers //////////

function addSelectionOutlinePadding(bBox) {
  return {
    x: bBox.x - SELECTION_OUTLINE_PADDING,
    y: bBox.y - SELECTION_OUTLINE_PADDING,
    width: bBox.width + SELECTION_OUTLINE_PADDING * 2,
    height: bBox.height + SELECTION_OUTLINE_PADDING * 2
  };
}