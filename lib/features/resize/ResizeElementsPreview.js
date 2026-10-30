import { forEach } from 'min-dash';

import {
  attr as svgAttr,
  remove as svgRemove
} from 'tiny-svg';

/**
 * @typedef {import('../../core/Canvas.js').default} Canvas
 * @typedef {import('../../core/EventBus.js').default} EventBus
 * @typedef {import('../preview-support/PreviewSupport.js').default} PreviewSupport
 */

var MARKER_RESIZING = 'djs-resizing';

var LOW_PRIORITY = 500;

/**
 * Provides previews for resizing multiple shapes together.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {PreviewSupport} previewSupport
 */
export default function ResizeElementsPreview(eventBus, canvas, previewSupport) {

  /**
   * Update a frame per resized shape.
   *
   * @param {Object} context
   */
  function updateFrames(context) {
    var frames = context.frames = context.frames || {};

    forEach(context.elements, function(element) {
      var frame = frames[ element.id ],
          bounds = context.newBounds[ element.id ];

      if (!frame) {
        frame = frames[ element.id ] = previewSupport.addFrame(element, canvas.getActiveLayer());

        canvas.addMarker(element, MARKER_RESIZING);
      }

      svgAttr(frame, {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      });
    });
  }

  /**
   * Remove frames.
   *
   * @param {Object} context
   */
  function removeFrames(context) {
    forEach(context.frames, function(frame) {
      svgRemove(frame);
    });

    forEach(context.elements, function(element) {
      canvas.removeMarker(element, MARKER_RESIZING);
    });
  }

  // add and update previews
  eventBus.on('elements.resize.move', LOW_PRIORITY, function(event) {
    updateFrames(event.context);
  });

  // remove previews
  eventBus.on('elements.resize.cleanup', function(event) {
    removeFrames(event.context);
  });
}

ResizeElementsPreview.$inject = [
  'eventBus',
  'canvas',
  'previewSupport'
];
