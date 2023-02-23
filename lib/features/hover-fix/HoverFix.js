import {
  closest as domClosest
} from 'min-dom';

import {
  toPoint
} from '../../util/Event';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 */

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
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function HoverFix(elementRegistry, eventBus, injector) {

  var self = this;

  var dragging = injector.get('dragging', false);

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


  if (dragging) {

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
  }


  /**
   * We make sure that element.out is always fired, even if the
   * browser swallows an element.out event.
   *
   * Event sequence:
   *
   * element.hover
   * (element.out >> sometimes swallowed)
   * element.hover >> ensure we fired element.out
   */
  (function() {
    var hoverGfx;
    var hover;

    eventBus.on('element.hover', function(event) {

      // (1) remember current hover element
      hoverGfx = event.gfx;
      hover = event.element;
    });

    eventBus.on('element.hover', HIGH_PRIORITY, function(event) {

      // (3) am I on an element still?
      if (hover) {

        // (4) that is a problem, gotta "simulate the out"
        eventBus.fire('element.out', {
          element: hover,
          gfx: hoverGfx
        });
      }

    });

    eventBus.on('element.out', function() {

      // (2) unset hover state if we correctly outed us *GG*
      hoverGfx = null;
      hover = null;
    });

  })();

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
  'elementRegistry',
  'eventBus',
  'injector'
];


// helpers /////////////////////

function getGfx(target) {
  return domClosest(target, 'svg, .djs-element', true);
}