import {
  getType as getElementType
} from '../../util/Elements';

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
export default class ChangeSupport {
  constructor(
      eventBus, canvas, elementRegistry,
      graphicsFactory) {


    // redraw shapes / connections on change

    eventBus.on('element.changed', event => {

      const element = event.element;

      // element might have been deleted and replaced by new element with same ID
      // thus check for parent of element except for root element
      if (element.parent || element === canvas.getRootElement()) {
        event.gfx = elementRegistry.getGraphics(element);
      }

      // shape + gfx may have been deleted
      if (!event.gfx) {
        return;
      }

      eventBus.fire(`${getElementType(element)}.changed`, event);
    });

    eventBus.on('elements.changed', event => {

      const elements = event.elements;

      elements.forEach(e => {
        eventBus.fire('element.changed', { element: e });
      });

      graphicsFactory.updateContainments(elements);
    });

    eventBus.on('shape.changed', ({ element, gfx }) => {
      graphicsFactory.update('shape', element, gfx);
    });

    eventBus.on('connection.changed', ({ element, gfx }) => {
      graphicsFactory.update('connection', element, gfx);
    });
  }
}

ChangeSupport.$inject = [
  'eventBus',
  'canvas',
  'elementRegistry',
  'graphicsFactory'
];