/**
 * @typedef {import('../../core/Canvas.js').default} Canvas
 * @typedef {import('../../core/EventBus.js').default} EventBus
 */

var MARKER_HOVER = 'hover',
    MARKER_SELECTED = 'selected';

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
 */
export default function SelectionVisuals(canvas, eventBus) {
  this._canvas = canvas;

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

    var oldSelection = new Set(event.oldSelection),
        newSelection = new Set(event.newSelection);

    for (let e of oldSelection) {
      if (!newSelection.has(e)) {
        deselect(e);
      }
    }

    for (let e of newSelection) {
      if (!oldSelection.has(e)) {
        select(e);
      }
    }
  });
}

SelectionVisuals.$inject = [
  'canvas',
  'eventBus'
];
