import {
  isArray,
  forEach
} from 'min-dash';

/**
 * @typedef {import('../../core/Canvas.js').default} Canvas
 * @typedef {import('../../core/EventBus.js').default} EventBus
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
   * @type {Set<Object>}
   */
  this._selectedElements = new Set();

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
  if (!this._selectedElements.has(element)) {
    return;
  }

  var oldSelection = this.get();

  this._selectedElements.delete(element);

  this._eventBus.fire('selection.changed', {
    oldSelection: oldSelection,
    newSelection: this.get()
  });
};

/**
 * Get the selected elements.
 *
 * @return {Object[]} The selected elements.
 */
Selection.prototype.get = function() {
  return Array.from(this._selectedElements);
};

/**
 * Check whether an element is selected.
 *
 * @param {Object} element The element.
 *
 * @return {boolean} Whether the element is selected.
 */
Selection.prototype.isSelected = function(element) {
  return this._selectedElements.has(element);
};


/**
 * Select one or many elements.
 *
 * @param {Object|Object[]} elements The element(s) to select.
 * @param {boolean} [add] Whether to add the element(s) to the selected elements.
 * Defaults to `false`.
 */
Selection.prototype.select = function(elements, add) {
  var oldSelection = this.get();

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
    forEach(elements, element => {
      this._selectedElements.add(element);
    });
  } else {
    this._selectedElements = new Set(elements);
  }

  this._eventBus.fire('selection.changed', {
    oldSelection: oldSelection,
    newSelection: this.get()
  });
};
