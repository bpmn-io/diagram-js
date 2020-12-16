import {
  set as cursorSet,
  unset as cursorUnset
} from '../../util/Cursor';

import {
  install as installClickTrap
} from '../../util/ClickTrap';

import {
  delta as deltaPos
} from '../../util/PositionUtil';

import {
  event as domEvent,
  closest as domClosest
} from 'min-dom';

import {
  toPoint
} from '../../util/Event';


var THRESHOLD = 15;


/**
 * Move the canvas via mouse.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function MoveCanvas(eventBus, canvas) {

  var context;


  // listen for move on element mouse down;
  // allow others to hook into the event before us though
  // (dragging / element moving will do this)
  eventBus.on('element.mousedown', 500, function(e) {
    return handleStart(e.originalEvent);
  });


  function handleMove(event) {

    var start = context.start,
        button = context.button,
        position = toPoint(event),
        delta = deltaPos(position, start);

    if (!context.dragging && length(delta) > THRESHOLD) {
      context.dragging = true;

      if (button === 0) {
        installClickTrap(eventBus);
      }

      cursorSet('grab');
    }

    if (context.dragging) {

      var lastPosition = context.last || context.start;

      delta = deltaPos(position, lastPosition);

      canvas.scroll({
        dx: delta.x,
        dy: delta.y
      });

      context.last = position;
    }

    // prevent select
    event.preventDefault();
  }


  function handleEnd(event) {
    domEvent.unbind(document, 'mousemove', handleMove);
    domEvent.unbind(document, 'mouseup', handleEnd);

    context = null;

    cursorUnset();
  }

  function handleStart(event) {

    // event is already handled by '.djs-draggable'
    if (domClosest(event.target, '.djs-draggable')) {
      return;
    }

    var button = event.button;

    // reject right mouse button or modifier key
    if (button >= 2 || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    context = {
      button: button,
      start: toPoint(event)
    };

    domEvent.bind(document, 'mousemove', handleMove);
    domEvent.bind(document, 'mouseup', handleEnd);

    // we've handled the event
    return true;
  }

  this.isActive = function() {
    return !!context;
  };

}


MoveCanvas.$inject = [
  'eventBus',
  'canvas'
];



// helpers ///////

function length(point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}
