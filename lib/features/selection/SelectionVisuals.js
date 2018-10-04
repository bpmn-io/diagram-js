import {
  forEach
} from 'min-dash';

var MARKER_HOVER = 'hover',
    MARKER_SELECTED = 'selected',
    MARKER_FOCUSSED = 'focussed';


/**
 * A plugin that adds a visible selection UI to shapes and connections
 * by appending the <code>hover</code> and <code>selected</code> classes to them.
 *
 * @class
 *
 * Makes elements selectable, too.
 *
 * @param {EventBus} events
 * @param {SelectionService} selection
 * @param {Canvas} canvas
 */
export default function SelectionVisuals(events, canvas, selection, styles) {

  this._multiSelectionBox = null;

  function addMarker(e, cls) {
    canvas.addMarker(e, cls);
  }

  function removeMarker(e, cls) {
    canvas.removeMarker(e, cls);
  }

  events.on('element.hover', function(event) {
    addMarker(event.element, MARKER_HOVER);
  });

  events.on('element.out', function(event) {
    removeMarker(event.element, MARKER_HOVER);
  });

  events.on('selection.changed', function(event) {

    function unmarkSelected(s) {
      removeMarker(s, MARKER_SELECTED);
    }

    function markSelected(s) {
      addMarker(s, MARKER_SELECTED);
    }

    var oldSelection = event.oldSelection,
        newSelection = event.newSelection;

    forEach(oldSelection, function(e) {
      if (newSelection.indexOf(e) === -1) {
        unmarkSelected(e);
      }
    });

    forEach(newSelection, function(e) {
      if (oldSelection.indexOf(e) === -1) {
        markSelected(e);
      }
    });
  });

  events.on('selection.focusChanged', function(event) {

    function unmarkFocussed(s) {
      removeMarker(s, MARKER_FOCUSSED);
    }

    function markFocussed(s) {
      addMarker(s, MARKER_FOCUSSED);
    }

    var oldFocussed = event.oldFocussed,
        newFocussed = event.newFocussed;

    if (oldFocussed) {
      unmarkFocussed(oldFocussed);
    }

    if (newFocussed) {
      markFocussed(newFocussed);
    }
  });
}

SelectionVisuals.$inject = [
  'eventBus',
  'canvas',
  'selection',
  'styles'
];