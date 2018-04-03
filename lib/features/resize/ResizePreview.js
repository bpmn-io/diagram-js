var MARKER_RESIZING = 'djs-resizing',
    MARKER_RESIZE_NOT_OK = 'resize-not-ok';

var LOW_PRIORITY = 500;

import {
  attr as svgAttr,
  remove as svgRemove,
  classes as svgClasses
} from 'tiny-svg';


/**
 * Provides previews for resizing shapes when resizing.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {PreviewSupport} previewSupport
 */
export default function ResizePreview(eventBus, canvas, previewSupport) {

  /**
   * Update resizer frame.
   *
   * @param {Object} context
   */
  function updateFrame(context) {

    var shape = context.shape,
        bounds = context.newBounds,
        frame = context.frame;

    if (!frame) {
      frame = context.frame = previewSupport.addFrame(shape, canvas.getDefaultLayer());

      canvas.addMarker(shape, MARKER_RESIZING);
    }

    if (bounds.width > 5) {
      svgAttr(frame, { x: bounds.x, width: bounds.width });
    }

    if (bounds.height > 5) {
      svgAttr(frame, { y: bounds.y, height: bounds.height });
    }

    if (context.canExecute) {
      svgClasses(frame).remove(MARKER_RESIZE_NOT_OK);
    } else {
      svgClasses(frame).add(MARKER_RESIZE_NOT_OK);
    }
  }

  /**
   * Remove resizer frame.
   *
   * @param {Object} context
   */
  function removeFrame(context) {
    var shape = context.shape,
        frame = context.frame;

    if (frame) {
      svgRemove(context.frame);
    }

    canvas.removeMarker(shape, MARKER_RESIZING);
  }

  // add and update previews
  eventBus.on('resize.move', LOW_PRIORITY, function(event) {
    updateFrame(event.context);
  });

  // remove previews
  eventBus.on('resize.cleanup', function(event) {
    removeFrame(event.context);
  });

}

ResizePreview.$inject = [
  'eventBus',
  'canvas',
  'previewSupport'
];