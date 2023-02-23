/**
 * @typedef {import('../../core/EventBus').default} EventBus
 */

/**
 * @param {EventBus} eventBus
 */
export default function Mouse(eventBus) {
  var self = this;

  this._lastMoveEvent = null;

  function setLastMoveEvent(mousemoveEvent) {
    self._lastMoveEvent = mousemoveEvent;
  }

  eventBus.on('canvas.init', function(context) {
    var svg = self._svg = context.svg;

    svg.addEventListener('mousemove', setLastMoveEvent);
  });

  eventBus.on('canvas.destroy', function() {
    self._lastMouseEvent = null;

    self._svg.removeEventListener('mousemove', setLastMoveEvent);
  });
}

Mouse.$inject = [ 'eventBus' ];

Mouse.prototype.getLastMoveEvent = function() {
  return this._lastMoveEvent || createMoveEvent(0, 0);
};

// helpers //////////

export function createMoveEvent(x, y) {
  var event = document.createEvent('MouseEvent');

  var screenX = x,
      screenY = y,
      clientX = x,
      clientY = y;

  if (event.initMouseEvent) {
    event.initMouseEvent(
      'mousemove',
      true,
      true,
      window,
      0,
      screenX,
      screenY,
      clientX,
      clientY,
      false,
      false,
      false,
      false,
      0,
      null
    );
  }

  return event;
}