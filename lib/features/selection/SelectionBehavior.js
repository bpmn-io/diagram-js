import {
  hasPrimaryModifier,
  hasSecondaryModifier
} from '../../util/Mouse';

import {
  find
} from 'min-dash';


export default function SelectionBehavior(
    eventBus, selection, canvas,
    elementRegistry) {

  eventBus.on('create.end', 500, function(e) {

    // select the created shape after a
    // successful create operation
    if (e.context.canExecute) {
      selection.select(e.context.shape);
    }
  });

  eventBus.on('connect.end', 500, function(e) {

    // select the connect end target
    // after a connect operation
    if (e.context.canExecute && e.context.target) {
      selection.select(e.context.target);
    }
  });

  eventBus.on('shape.move.end', 500, function(e) {
    var previousSelection = e.previousSelection || [];

    var shape = elementRegistry.get(e.context.shape.id);

    // make sure at least the main moved element is being
    // selected after a move operation
    var inSelection = find(previousSelection, function(selectedShape) {
      return shape.id === selectedShape.id;
    });

    if (!inSelection) {
      selection.select(shape);
    }
  });

  // Shift + click selection
  eventBus.on('element.click', function(event) {

    var element = event.element;

    // don't select root element
    if (element === canvas.getRootElement()) {
      element = null;
    }

    console.log(`click #${element && element.id}`);

    // SHIFT + CLICK : add element to selection
    var forceAdd = hasSecondaryModifier(event);

    if (forceAdd) {
      return selection.select(element, true);
    }

    var isSelected = selection.isSelected(element);

    // CTRL + CLICK : toggle element selection
    var toggleAdd = hasPrimaryModifier(event);

    if (toggleAdd) {
      if (isSelected) {
        return selection.deselect(element);
      } else {
        return selection.select(element, true);
      }
    }

    // CLICK : select element
    if (!isSelected) {
      selection.select(element);
    }
  });

  eventBus.on('element.focus', function(event) {
    var element = event.element;

    console.log(`focus #${element.id}`);

    selection.setFocussed(element);

    const timeout = setTimeout(function() {

      console.log('FOCUS WITHOUT CLICK');

      if (selection.isSelected(element)) {
        return;
      }

      selection.select(element, false);
    }, 100);

    eventBus.on('element.click', function() {
      clearTimeout(timeout);
    });
  });

  eventBus.on('element.blur', function(event) {
    var element = event.element;

    console.log(`blur #${element.id}`);

    selection.setFocussed(false);
  });
}

SelectionBehavior.$inject = [
  'eventBus',
  'selection',
  'canvas',
  'elementRegistry'
];
