import {
  closest as domClosest
} from 'min-dom';

import {
  toPoint
} from '../../util/Event';

var HIGH_PRIORITY = 1500;


/**
 * Browsers may swallow certain events (hover, out ...) if users are to
 * fast with the mouse.
 *
 * @see http://stackoverflow.com/questions/7448468/why-cant-i-reliably-capture-a-mouseout-event
 *
 * The fix implemented in this component ensure that we
 *
 * 1) have a hover state after a successful drag.move event
 * 2) have an out event when dragging leaves an element
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {ElementRegistry} elementRegistry
 */
export default function HoverFix(eventBus, dragging, elementRegistry) {

  var self = this;

  /**
   * Make sure we are god damn hovering!
   *
   * @param {Event} dragging event
   */
  function ensureHover(event) {

    if (event.hover) {
      return;
    }

    var originalEvent = event.originalEvent;

    var gfx = self._findTargetGfx(originalEvent);

    var element = gfx && elementRegistry.get(gfx);

    if (gfx && element) {

      // 1) cancel current mousemove
      event.stopPropagation();

      // 2) emit fake hover for new target
      dragging.hover({ element: element, gfx: gfx });

      // 3) re-trigger move event
      dragging.move(originalEvent);
    }
  }

  /**
   * We wait for a specific sequence of events before
   * emitting a fake drag.hover event.
   *
   * Event Sequence:
   *
   * drag.start
   * drag.move >> ensure we are hovering
   */
  eventBus.on('drag.start', function(event) {

    eventBus.once('drag.move', HIGH_PRIORITY, function(event) {

      ensureHover(event);

    });

  });


  /**
   * We make sure that drag.out is always fired, even if the
   * browser swallows an element.out event.
   *
   * Event sequence:
   *
   * drag.hover
   * (element.out >> sometimes swallowed)
   * element.hover >> ensure we fired drag.out
   */
  eventBus.on('drag.init', function() {

    var hover, hoverGfx;

    function setDragHover(event) {
      hover = event.hover;
      hoverGfx = event.hoverGfx;
    }

    function unsetHover() {
      hover = null;
      hoverGfx = null;
    }

    function ensureOut() {

      if (!hover) {
        return;
      }

      var element = hover,
          gfx = hoverGfx;

      hover = null;
      hoverGfx = null;

      // emit synthetic out event
      dragging.out({
        element: element,
        gfx: gfx
      });
    }

    eventBus.on('drag.hover', setDragHover);
    eventBus.on('element.out', unsetHover);
    eventBus.on('element.hover', HIGH_PRIORITY, ensureOut);

    eventBus.once('drag.cleanup', function() {
      eventBus.off('drag.hover', setDragHover);
      eventBus.off('element.out', unsetHover);
      eventBus.off('element.hover', ensureOut);
    });

  });

  this._findTargetGfx = function(event) {
    var position,
        target;

    if (!(event instanceof MouseEvent)) {
      return;
    }

    position = toPoint(event);

    // damn expensive operation, ouch!
    target = document.elementFromPoint(position.x, position.y);

    return getGfx(target);
  };

}

HoverFix.$inject = [
  'eventBus',
  'dragging',
  'elementRegistry'
];


// helpers /////////////////////

function getGfx(target) {
  return domClosest(target, 'svg, .djs-element', true);
}