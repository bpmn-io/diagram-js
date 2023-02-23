import {
  assign,
  forEach
} from 'min-dash';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  clear as svgClear,
  create as svgCreate
} from 'tiny-svg';

import { getBBox } from '../../util/Elements';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('./Selection').default} Selection
 */

var MARKER_HOVER = 'hover',
    MARKER_SELECTED = 'selected';

var SELECTION_OUTLINE_PADDING = 6;


/**
 * A plugin that adds a visible selection UI to shapes and connections
 * by appending the <code>hover</code> and <code>selected</code> classes to them.
 *
 * @class
 *
 * Makes elements selectable, too.
 *
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {Selection} selection
 */
export default function SelectionVisuals(canvas, eventBus, selection) {
  this._canvas = canvas;

  var self = this;

  this._multiSelectionBox = null;

  function addMarker(e, cls) {
    canvas.addMarker(e, cls);
  }

  function removeMarker(e, cls) {
    canvas.removeMarker(e, cls);
  }

  eventBus.on('element.hover', function(event) {
    addMarker(event.element, MARKER_HOVER);
  });

  eventBus.on('element.out', function(event) {
    removeMarker(event.element, MARKER_HOVER);
  });

  eventBus.on('selection.changed', function(event) {

    function deselect(s) {
      removeMarker(s, MARKER_SELECTED);
    }

    function select(s) {
      addMarker(s, MARKER_SELECTED);
    }

    var oldSelection = event.oldSelection,
        newSelection = event.newSelection;

    forEach(oldSelection, function(e) {
      if (newSelection.indexOf(e) === -1) {
        deselect(e);
      }
    });

    forEach(newSelection, function(e) {
      if (oldSelection.indexOf(e) === -1) {
        select(e);
      }
    });

    self._updateSelectionOutline(newSelection);
  });


  eventBus.on('element.changed', function(event) {
    if (selection.isSelected(event.element)) {
      self._updateSelectionOutline(selection.get());
    }
  });
}

SelectionVisuals.$inject = [
  'canvas',
  'eventBus',
  'selection'
];

SelectionVisuals.prototype._updateSelectionOutline = function(selection) {
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

// helpers //////////

function addSelectionOutlinePadding(bBox) {
  return {
    x: bBox.x - SELECTION_OUTLINE_PADDING,
    y: bBox.y - SELECTION_OUTLINE_PADDING,
    width: bBox.width + SELECTION_OUTLINE_PADDING * 2,
    height: bBox.height + SELECTION_OUTLINE_PADDING * 2
  };
}