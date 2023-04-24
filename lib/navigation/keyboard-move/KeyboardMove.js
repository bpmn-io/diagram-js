import { assign } from 'min-dash';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../features/keyboard/Keyboard').default} Keyboard
 */

var DEFAULT_CONFIG = {
  moveSpeed: 50,
  moveSpeedAccelerated: 200
};


/**
 * A feature that allows users to move the canvas using the keyboard.
 *
 * @param {Object} config
 * @param {number} [config.moveSpeed=50]
 * @param {number} [config.moveSpeedAccelerated=200]
 * @param {Keyboard} keyboard
 * @param {Canvas} canvas
 */
export default function KeyboardMove(
    config,
    keyboard,
    canvas
) {

  var self = this;

  this._config = assign({}, DEFAULT_CONFIG, config || {});

  keyboard.addListener(arrowsListener);


  function arrowsListener(context) {

    var event = context.keyEvent,
        config = self._config;

    if (!keyboard.isCmd(event)) {
      return;
    }

    if (keyboard.isKey([
      'ArrowLeft', 'Left',
      'ArrowUp', 'Up',
      'ArrowDown', 'Down',
      'ArrowRight', 'Right'
    ], event)) {

      var speed = (
        keyboard.isShift(event) ?
          config.moveSpeedAccelerated :
          config.moveSpeed
      );

      var direction;

      switch (event.key) {
      case 'ArrowLeft':
      case 'Left':
        direction = 'left';
        break;
      case 'ArrowUp':
      case 'Up':
        direction = 'up';
        break;
      case 'ArrowRight':
      case 'Right':
        direction = 'right';
        break;
      case 'ArrowDown':
      case 'Down':
        direction = 'down';
        break;
      }

      self.moveCanvas({
        speed: speed,
        direction: direction
      });

      return true;
    }
  }

  /**
   * @param {{
   *   direction: 'up' | 'down' | 'left' | 'right';
   *   speed: number;
   * }} options
   */
  this.moveCanvas = function(options) {

    var dx = 0,
        dy = 0,
        speed = options.speed;

    var actualSpeed = speed / Math.min(Math.sqrt(canvas.viewbox().scale), 1);

    switch (options.direction) {
    case 'left': // Left
      dx = actualSpeed;
      break;
    case 'up': // Up
      dy = actualSpeed;
      break;
    case 'right': // Right
      dx = -actualSpeed;
      break;
    case 'down': // Down
      dy = -actualSpeed;
      break;
    }

    canvas.scroll({
      dx: dx,
      dy: dy
    });
  };

}


KeyboardMove.$inject = [
  'config.keyboardMove',
  'keyboard',
  'canvas'
];
