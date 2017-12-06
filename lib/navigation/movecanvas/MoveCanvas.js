'use strict';

var Cursor = require('../../util/Cursor'),
    ClickTrap = require('../../util/ClickTrap'),
    substract = require('../../util/Math').substract,
    domEvent = require('min-dom/lib/event'),
    domClosest = require('min-dom/lib/closest'),
    EventUtil = require('../../util/Event');


function length(point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}

var THRESHOLD = 15;


function MoveCanvas(eventBus, canvas) {

  var context;

  function handleMove(event) {

    var start = context.start,
        position = EventUtil.toPoint(event),
        delta = substract(position, start);

    if (!context.dragging && length(delta) > THRESHOLD) {
      context.dragging = true;

      ClickTrap.install(eventBus);

      Cursor.set('grab');
    }

    if (context.dragging) {

      var lastPosition = context.last || context.start;

      delta = substract(position, lastPosition);

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

    Cursor.unset();
  }

  function handleStart(event) {
    // event is already handled by '.djs-draggable'
    if (domClosest(event.target, '.djs-draggable')) {
      return;
    }


    // reject non-left left mouse button or modifier key
    if (event.button || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    context = {
      start: EventUtil.toPoint(event)
    };

    domEvent.bind(document, 'mousemove', handleMove);
    domEvent.bind(document, 'mouseup', handleEnd);

    // we've handled the event
    return true;
  }

  // listen for move on element mouse down;
  // allow others to hook into the event before us though
  // (dragging / element moving will do this)
  eventBus.on('element.mousedown', 500, function(e) {
    return handleStart(e.originalEvent);
  });

}


MoveCanvas.$inject = [ 'eventBus', 'canvas' ];

module.exports = MoveCanvas;
