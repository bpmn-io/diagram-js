import { assign } from 'min-dash';


var DEFAULT_CONFIG = {
  moveSpeed: 50,
  moveSpeedAccelerated: 200
};


/**
 *
 * @param {Object} config
 * @param {Number} [config.moveSpeed=50]
 * @param {Number} [config.moveSpeedAccelerated=200]
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
export default function KeyboardNavigation(
    config,
    keyboard,
    editorActions
) {

  var self = this;

  this._config = assign({}, DEFAULT_CONFIG, config || {});

  keyboard.addListener(arrowsListener);


  function arrowsListener(context) {

    var event = context.event,
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

      var opts = {
        speed: keyboard.isShift(event) ? config.moveSpeedAccelerated : config.moveSpeed
      };

      switch (event.key) {
      case 'ArrowLeft':
      case 'Left':
        opts.direction = 'left';
        break;
      case 'ArrowUp':
      case 'Up':
        opts.direction = 'up';
        break;
      case 'ArrowRight':
      case 'Right':
        opts.direction = 'right';
        break;
      case 'ArrowDown':
      case 'Down':
        opts.direction = 'down';
        break;
      }

      editorActions.trigger('moveCanvas', opts);

      return true;
    }
  }
}


KeyboardNavigation.$inject = [
  'config.keyboardMove',
  'keyboard',
  'editorActions'
];
