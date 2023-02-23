import {
  translate
} from '../../util/SvgTransformUtil';

import { getVisual } from '../../util/GraphicsUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../../core/GraphicsFactory').default} GraphicsFactory
 * @typedef {import('../preview-support/PreviewSupport').default} PreviewSupport
 * @typedef {import('../../draw/Styles').default} Styles
 */

var LOW_PRIORITY = 750;

/**
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 * @param {PreviewSupport} previewSupport
 * @param {Styles} styles
 */
export default function CreatePreview(
    canvas,
    eventBus,
    graphicsFactory,
    previewSupport,
    styles
) {
  function createDragGroup(elements) {
    var dragGroup = svgCreate('g');

    svgAttr(dragGroup, styles.cls('djs-drag-group', [ 'no-events' ]));

    var childrenGfx = svgCreate('g');

    elements.forEach(function(element) {

      // create graphics
      var gfx;

      if (element.hidden) {
        return;
      }

      if (element.waypoints) {
        gfx = graphicsFactory._createContainer('connection', childrenGfx);

        graphicsFactory.drawConnection(getVisual(gfx), element);
      } else {
        gfx = graphicsFactory._createContainer('shape', childrenGfx);

        graphicsFactory.drawShape(getVisual(gfx), element);

        translate(gfx, element.x, element.y);
      }

      // add preview
      previewSupport.addDragger(element, dragGroup, gfx);
    });

    return dragGroup;
  }

  eventBus.on('create.move', LOW_PRIORITY, function(event) {

    var hover = event.hover,
        context = event.context,
        elements = context.elements,
        dragGroup = context.dragGroup;

    // lazily create previews
    if (!dragGroup) {
      dragGroup = context.dragGroup = createDragGroup(elements);
    }

    var activeLayer;

    if (hover) {
      if (!dragGroup.parentNode) {
        activeLayer = canvas.getActiveLayer();

        svgAppend(activeLayer, dragGroup);
      }

      translate(dragGroup, event.x, event.y);
    } else {
      svgRemove(dragGroup);
    }
  });

  eventBus.on('create.cleanup', function(event) {
    var context = event.context,
        dragGroup = context.dragGroup;

    if (dragGroup) {
      svgRemove(dragGroup);
    }
  });
}

CreatePreview.$inject = [
  'canvas',
  'eventBus',
  'graphicsFactory',
  'previewSupport',
  'styles'
];
