var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../connect/Connect').default} Connect
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../mouse/Mouse').default} Mouse
 * @typedef {import('../rules/Rules').default} Rules
 * @typedef {import('../tool-manager/ToolManager').default} ToolManager
 *
 * @typedef {import('../../model/Types').Element} Element
 */

/**
 * @class
 * @constructor
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {Connect} connect
 * @param {Canvas} canvas
 * @param {ToolManager} toolManager
 * @param {Rules} rules
 * @param {Mouse} mouse
 */
export default function GlobalConnect(
    eventBus, dragging, connect,
    canvas, toolManager, rules,
    mouse) {

  var self = this;

  this._dragging = dragging;
  this._rules = rules;
  this._mouse = mouse;

  toolManager.registerTool('global-connect', {
    tool: 'global-connect',
    dragging: 'global-connect.drag'
  });

  eventBus.on('global-connect.hover', function(event) {
    var context = event.context,
        startTarget = event.hover;

    var canStartConnect = context.canStartConnect = self.canStartConnect(startTarget);

    // simply ignore hover
    if (canStartConnect === null) {
      return;
    }

    context.startTarget = startTarget;

    canvas.addMarker(startTarget, canStartConnect ? MARKER_OK : MARKER_NOT_OK);
  });


  eventBus.on([ 'global-connect.out', 'global-connect.cleanup' ], function(event) {
    var startTarget = event.context.startTarget,
        canStartConnect = event.context.canStartConnect;

    if (startTarget) {
      canvas.removeMarker(startTarget, canStartConnect ? MARKER_OK : MARKER_NOT_OK);
    }
  });


  eventBus.on([ 'global-connect.ended' ], function(event) {
    var context = event.context,
        startTarget = context.startTarget,
        startPosition = {
          x: event.x,
          y: event.y
        };

    var canStartConnect = self.canStartConnect(startTarget);

    if (!canStartConnect) {
      return;
    }

    eventBus.once('element.out', function() {
      eventBus.once([ 'connect.ended', 'connect.canceled' ], function() {
        eventBus.fire('global-connect.drag.ended');
      });

      connect.start(null, startTarget, startPosition);
    });

    return false;
  });
}

GlobalConnect.$inject = [
  'eventBus',
  'dragging',
  'connect',
  'canvas',
  'toolManager',
  'rules',
  'mouse'
];

/**
 * Initiates tool activity.
 */
GlobalConnect.prototype.start = function(event, autoActivate) {
  this._dragging.init(event, 'global-connect', {
    autoActivate: autoActivate,
    trapClick: false,
    data: {
      context: {}
    }
  });
};

GlobalConnect.prototype.toggle = function() {

  if (this.isActive()) {
    return this._dragging.cancel();
  }

  var mouseEvent = this._mouse.getLastMoveEvent();

  return this.start(mouseEvent, !!mouseEvent);
};

GlobalConnect.prototype.isActive = function() {
  var context = this._dragging.context();

  return context && /^global-connect/.test(context.prefix);
};

/**
 * Check if source element can initiate connection.
 *
 * @param {Element} startTarget
 * @return {boolean}
 */
GlobalConnect.prototype.canStartConnect = function(startTarget) {
  return this._rules.allowed('connection.start', { source: startTarget });
};
