import {
  isArray,
  forEach
} from 'min-dash';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/EventBus').default} EventBus
 */

/**
 * A service that offers the current selection in a diagram.
 * Offers the api to control the selection, too.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function Selection(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;

  /**
   * @type {Object[]}
   */
  this._selectedElements = [];

  var self = this;

  eventBus.on([ 'shape.remove', 'connection.remove' ], function(e) {
    var element = e.element;
    self.deselect(element);
  });

  eventBus.on([ 'diagram.clear', 'root.set' ], function(e) {
    self.select(null);
  });
}

Selection.$inject = [ 'eventBus', 'canvas' ];

/**
 * Deselect an element.
 *
 * @param {Object} element The element to deselect.
 */
Selection.prototype.deselect = function(element) {
  var selectedElements = this._selectedElements;

  var idx = selectedElements.indexOf(element);

  if (idx !== -1) {
    var oldSelection = selectedElements.slice();

    selectedElements.splice(idx, 1);

    this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
  }
};

/**
 * Get the selected elements.
 *
 * @return {Object[]} The selected elements.
 */
Selection.prototype.get = function() {
  return this._selectedElements;
};

/**
 * Check whether an element is selected.
 *
 * @param {Object} element The element.
 *
 * @return {boolean} Whether the element is selected.
 */
Selection.prototype.isSelected = function(element) {
  return this._selectedElements.indexOf(element) !== -1;
};


/**
 * Select one or many elements.
 *
 * @param {Object|Object[]} elements The element(s) to select.
 * @param {boolean} [add] Whether to add the element(s) to the selected elements.
 * Defaults to `false`.
 */
Selection.prototype.select = function(elements, add) {
  var selectedElements = this._selectedElements,
      oldSelection = selectedElements.slice();

  if (!isArray(elements)) {
    elements = elements ? [ elements ] : [];
  }

  var canvas = this._canvas;

  var rootElement = canvas.getRootElement();

  elements = elements.filter(function(element) {
    var elementRoot = canvas.findRoot(element);

    return rootElement === elementRoot;
  });

  // selection may be cleared by passing an empty array or null
  // to the method
  if (add) {
    forEach(elements, function(element) {
      if (selectedElements.indexOf(element) !== -1) {

        // already selected
        return;
      } else {
        selectedElements.push(element);
      }
    });
  } else {
    this._selectedElements = selectedElements = elements.slice();
  }

  this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
};
