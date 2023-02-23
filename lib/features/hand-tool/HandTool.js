import {
  hasPrimaryModifier
} from '../../util/Mouse';

import { isKey } from '../../features/keyboard/KeyboardUtil';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../mouse/Mouse').default} Mouse
 * @typedef {import('../tool-manager/ToolManager').default} ToolManager
 */

var HIGH_PRIORITY = 1500;
var HAND_CURSOR = 'grab';

/**
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Dragging} dragging
 * @param {Injector} injector
 * @param {ToolManager} toolManager
 * @param {Mouse} mouse
 */
export default function HandTool(
    eventBus, canvas, dragging,
    injector, toolManager, mouse) {

  this._dragging = dragging;
  this._mouse = mouse;

  var self = this,
      keyboard = injector.get('keyboard', false);

  toolManager.registerTool('hand', {
    tool: 'hand',
    dragging: 'hand.move'
  });

  eventBus.on('element.mousedown', HIGH_PRIORITY, function(event) {

    if (!hasPrimaryModifier(event)) {
      return;
    }

    self.activateMove(event.originalEvent, true);

    return false;
  });

  keyboard && keyboard.addListener(HIGH_PRIORITY, function(e) {
    if (!isSpace(e.keyEvent) || self.isActive()) {
      return;
    }

    var mouseEvent = self._mouse.getLastMoveEvent();

    self.activateMove(mouseEvent, !!mouseEvent);
  }, 'keyboard.keydown');

  keyboard && keyboard.addListener(HIGH_PRIORITY, function(e) {
    if (!isSpace(e.keyEvent) || !self.isActive()) {
      return;
    }

    self.toggle();
  }, 'keyboard.keyup');

  eventBus.on('hand.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return false;
    }

    eventBus.once('hand.ended', function() {
      self.activateMove(event.originalEvent, { reactivate: true });
    });

  });

  eventBus.on('hand.move.move', function(event) {
    var scale = canvas.viewbox().scale;

    canvas.scroll({
      dx: event.dx * scale,
      dy: event.dy * scale
    });
  });

  eventBus.on('hand.move.end', function(event) {
    var context = event.context,
        reactivate = context.reactivate;

    // Don't reactivate if the user is using the keyboard keybinding
    if (!hasPrimaryModifier(event) && reactivate) {

      eventBus.once('hand.move.ended', function(event) {
        self.activateHand(event.originalEvent, true, true);
      });

    }

    return false;
  });

}

HandTool.$inject = [
  'eventBus',
  'canvas',
  'dragging',
  'injector',
  'toolManager',
  'mouse'
];


HandTool.prototype.activateMove = function(event, autoActivate, context) {
  if (typeof autoActivate === 'object') {
    context = autoActivate;
    autoActivate = false;
  }

  this._dragging.init(event, 'hand.move', {
    autoActivate: autoActivate,
    cursor: HAND_CURSOR,
    data: {
      context: context || {}
    }
  });
};

HandTool.prototype.activateHand = function(event, autoActivate, reactivate) {
  this._dragging.init(event, 'hand', {
    trapClick: false,
    autoActivate: autoActivate,
    cursor: HAND_CURSOR,
    data: {
      context: {
        reactivate: reactivate
      }
    }
  });
};

HandTool.prototype.toggle = function() {
  if (this.isActive()) {
    return this._dragging.cancel();
  }

  var mouseEvent = this._mouse.getLastMoveEvent();

  this.activateHand(mouseEvent, !!mouseEvent);
};

HandTool.prototype.isActive = function() {
  var context = this._dragging.context();

  if (context) {
    return /^(hand|hand\.move)$/.test(context.prefix);
  }

  return false;
};

// helpers //////////

function isSpace(keyEvent) {
  return isKey('Space', keyEvent);
}