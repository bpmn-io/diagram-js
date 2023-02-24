import {
  getType as getElementType
} from '../../util/Elements';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../../core/GraphicsFactory').default} GraphicsFactory
 */

/**
 * Adds change support to the diagram, including
 *
 * <ul>
 *   <li>redrawing shapes and connections on change</li>
 * </ul>
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementRegistry} elementRegistry
 * @param {GraphicsFactory} graphicsFactory
 */
export default function ChangeSupport(
    eventBus, canvas, elementRegistry,
    graphicsFactory) {


  // redraw shapes / connections on change

  eventBus.on('element.changed', function(event) {

    var element = event.element;

    // element might have been deleted and replaced by new element with same ID
    // thus check for parent of element except for root element
    if (element.parent || element === canvas.getRootElement()) {
      event.gfx = elementRegistry.getGraphics(element);
    }

    // shape + gfx may have been deleted
    if (!event.gfx) {
      return;
    }

    eventBus.fire(getElementType(element) + '.changed', event);
  });

  eventBus.on('elements.changed', function(event) {

    var elements = event.elements;

    elements.forEach(function(e) {
      eventBus.fire('element.changed', { element: e });
    });

    graphicsFactory.updateContainments(elements);
  });

  eventBus.on('shape.changed', function(event) {
    graphicsFactory.update('shape', event.element, event.gfx);
  });

  eventBus.on('connection.changed', function(event) {
    graphicsFactory.update('connection', event.element, event.gfx);
  });
}

ChangeSupport.$inject = [
  'eventBus',
  'canvas',
  'elementRegistry',
  'graphicsFactory'
];