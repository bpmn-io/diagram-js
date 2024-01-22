import {
  hasSecondaryModifier,
  isPrimaryButton
} from '../../util/Mouse';

import {
  find,
  isArray
} from 'min-dash';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('./Selection').default} Selection
 */

/**
 * @param {EventBus} eventBus
 * @param {Selection} selection
 * @param {Canvas} canvas
 * @param {ElementRegistry} elementRegistry
 */
export default function SelectionBehavior(eventBus, selection, canvas, elementRegistry) {

  // Select elements on create
  eventBus.on('create.end', 500, function(event) {
    var context = event.context,
        canExecute = context.canExecute,
        elements = context.elements,
        hints = context.hints || {},
        autoSelect = hints.autoSelect;

    if (canExecute) {
      if (autoSelect === false) {

        // Select no elements
        return;
      }

      if (isArray(autoSelect)) {
        selection.select(autoSelect);
      } else {

        // Select all elements by default
        selection.select(elements.filter(isShown));
      }
    }
  });

  // Select connection targets on connect
  eventBus.on('connect.end', 500, function(event) {
    var context = event.context,
        connection = context.connection;

    if (connection) {
      selection.select(connection);
    }
  });

  // Select shapes on move
  eventBus.on('shape.move.end', 500, function(event) {
    var previousSelection = event.previousSelection || [];

    var shape = elementRegistry.get(event.context.shape.id);

    // Always select main shape on move
    var isSelected = find(previousSelection, function(selectedShape) {
      return shape.id === selectedShape.id;
    });

    if (!isSelected) {
      selection.select(shape);
    }
  });

  // Select elements on click
  eventBus.on('element.click', function(event) {

    if (!isPrimaryButton(event)) {
      return;
    }

    var element = event.element;

    if (element === canvas.getRootElement()) {
      element = null;
    }

    var isSelected = selection.isSelected(element),
        isMultiSelect = selection.get().length > 1;

    // Add to selection if SHIFT pressed
    var add = hasSecondaryModifier(event);

    if (isSelected && isMultiSelect) {
      if (add) {

        // Deselect element
        return selection.deselect(element);
      } else {

        // Select element only
        return selection.select(element);
      }
    } else if (!isSelected) {

      // Select element
      selection.select(element, add);
    } else {

      // Deselect element
      selection.deselect(element);
    }
  });
}

SelectionBehavior.$inject = [
  'eventBus',
  'selection',
  'canvas',
  'elementRegistry'
];


function isShown(element) {
  return !element.hidden;
}
