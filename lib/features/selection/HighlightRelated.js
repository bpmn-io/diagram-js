import {
  forEach
} from 'min-dash';

import {
  getType
} from '../../util/Elements';

var MARKER_RELATED_SELECTED = 'related-selected',
    MARKER_RELATED_HOVER = 'related-hover';


/**
   * A plugin that adds a visible selection UI to related elements after an element
   * was selected by appending the <code>related-selected</code> and
   * <code>related-hover</code> classes to them.
   *
   * @class
   *
   * Creates outline on related elements after selecting an element
   *
   * @param {EventBus} events
   * @param {Canvas} canvas
   */
export default function HighlightRelated(events, canvas) {

  function applyToRelatedElements(e, cls, fn) {

    // shape, connection -> mark related labels
    if (getType(e) === 'shape' || getType(e) === 'connection') {
      forEach(e.labels, function(label) {
        fn(label, cls);
      });
    }

    // label -> mark related shape, connection
    if (e.labelTarget) {
      fn(e.labelTarget, cls);
    }
  }

  function addMarkerToRelated(e, cls) {
    applyToRelatedElements(e, cls, canvas.addMarker.bind(canvas));
  }

  function removeMarkerFromRelated(e, cls) {
    applyToRelatedElements(e, cls, canvas.removeMarker.bind(canvas));
  }

  events.on('element.hover', function(event) {
    addMarkerToRelated(event.element, MARKER_RELATED_HOVER);
  });

  events.on('element.out', function(event) {
    removeMarkerFromRelated(event.element, MARKER_RELATED_HOVER);
  });

  events.on('selection.changed', function(event) {
    var oldSelection = event.oldSelection,
        newSelection = event.newSelection;

    forEach(oldSelection, function(e) {
      if (newSelection.indexOf(e) === -1) {
        removeMarkerFromRelated(e, MARKER_RELATED_SELECTED);
      }
    });

    forEach(newSelection, function(e) {
      if (oldSelection.indexOf(e) === -1) {
        addMarkerToRelated(e, MARKER_RELATED_SELECTED);
      }
    });
  });
}

HighlightRelated.$inject = [
  'eventBus',
  'canvas',
];