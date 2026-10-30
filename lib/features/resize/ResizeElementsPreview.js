import { forEach } from 'min-dash';

import {
  attr as svgAttr,
  remove as svgRemove
} from 'tiny-svg';

/**
 * @typedef {import('../../core/Canvas.js').default} Canvas
 * @typedef {import('../../core/ElementRegistry.js').default} ElementRegistry
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
 * @param {ElementRegistry} elementRegistry
 * @param {PreviewSupport} previewSupport
 */
export default function ResizeElementsPreview(eventBus, canvas, elementRegistry, previewSupport) {

  /**
   * Show a frame per changed shape.
   *
   * @param {Object} context
   */
  function updateFrames(context) {
    var frames = context.frames = context.frames || {},
        newBounds = context.newBounds;

    forEach(frames, function(frame, id) {
      if (!newBounds[ id ]) {
        removeFrame(frames, id);
      }
    });

    forEach(newBounds, function(bounds, id) {
      var frame = frames[ id ];

      if (!frame) {
        frame = frames[ id ] = previewSupport.addFrame(elementRegistry.get(id), canvas.getActiveLayer());

        canvas.addMarker(id, MARKER_RESIZING);
      }

      svgAttr(frame, {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      });
    });
  }

  function removeFrame(frames, id) {
    svgRemove(frames[ id ]);

    delete frames[ id ];

    canvas.removeMarker(id, MARKER_RESIZING);
  }

  // add and update previews
  eventBus.on('elements.resize.move', LOW_PRIORITY, function(event) {
    updateFrames(event.context);
  });

  // remove previews
  eventBus.on('elements.resize.cleanup', function(event) {
    var frames = event.context.frames;

    forEach(frames, function(frame, id) {
      removeFrame(frames, id);
    });
  });
}

ResizeElementsPreview.$inject = [
  'eventBus',
  'canvas',
  'elementRegistry',
  'previewSupport'
];
