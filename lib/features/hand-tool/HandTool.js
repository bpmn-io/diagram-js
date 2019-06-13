import { hasPrimaryModifier } from '../../util/Mouse';

import { isKey } from '../../features/keyboard/KeyboardUtil';

var HIGH_PRIORITY = 1500;
var HAND_CURSOR = 'grab';


export default function HandTool(eventBus, canvas, dragging, injector, toolManager) {
  this._dragging = dragging;

  var self = this,
      keyboard = injector.get('keyboard', false);

  toolManager.registerTool('hand', {
    tool: 'hand',
    dragging: 'hand.move'
  });

  eventBus.on('element.mousedown', HIGH_PRIORITY, function(event) {
    if (hasPrimaryModifier(event)) {
      this.activateMove(event.originalEvent);

      return false;
    }
  }, this);

  keyboard && keyboard.addListener(HIGH_PRIORITY, function(e) {
    if (!isSpace(e.keyEvent)) {
      return;
    }

    if (self.isActive()) {
      return;
    }

    function activateMove(event) {
      self.activateMove(event);

      window.removeEventListener('mousemove', activateMove);
    }

    window.addEventListener('mousemove', activateMove);

    function deactivateMove(e) {
      if (!isSpace(e.keyEvent)) {
        return;
      }

      window.removeEventListener('mousemove', activateMove);

      keyboard.removeListener(deactivateMove, 'keyboard.keyup');

      dragging.cancel();
    }

    keyboard.addListener(HIGH_PRIORITY, deactivateMove, 'keyboard.keyup');
  }, 'keyboard.keydown');

  eventBus.on('hand.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return false;
    }

    eventBus.once('hand.ended', function() {
      this.activateMove(event.originalEvent, { reactivate: true });
    }, this);

  }, this);


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
        this.activateHand(event.originalEvent, true, true);
      }, this);

    }

    return false;
  }, this);

}

HandTool.$inject = [
  'eventBus',
  'canvas',
  'dragging',
  'injector',
  'toolManager'
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
    this._dragging.cancel();
  } else {
    this.activateHand();
  }
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
  return isKey(' ', keyEvent);
}