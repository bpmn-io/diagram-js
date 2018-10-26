import {
  assign
} from 'min-dash';


var DEFAULT_CONFIG = {
  moveSpeed: 1,
  moveSpeedAccelerated: 10
};

var HIGHER_PRIORITY = 1500;

var LEFT = 'left';
var UP = 'up';
var RIGHT = 'right';
var DOWN = 'down';

var KEY_TO_DIRECTION = {
  ArrowLeft: LEFT,
  Left: LEFT,
  ArrowUp: UP,
  Up: UP,
  ArrowRight: RIGHT,
  Right: RIGHT,
  ArrowDown: DOWN,
  Down: DOWN
};

var DIRECTIONS_DELTA = {
  left: function(speed) {
    return {
      x: -speed,
      y: 0
    };
  },
  up: function(speed) {
    return {
      x: 0,
      y: -speed
    };
  },
  right: function(speed) {
    return {
      x: speed,
      y: 0
    };
  },
  down: function(speed) {
    return {
      x: 0,
      y: speed
    };
  }
};


/**
 * Enables to move selection with keyboard arrows.
 * Use with Shift for modified speed (default=1, with Shift=10).
 * Pressed Cmd/Ctrl turns the feature off.
 *
 * @param {Object} config
 * @param {Number} [config.moveSpeed=1]
 * @param {Number} [config.moveSpeedAccelerated=10]
 * @param {Keyboard} keyboard
 * @param {Modeling} modeling
 * @param {Selection} selection
 */
export default function KeyboardMoveSelection(
    config, keyboard,
    modeling, selection
) {

  var self = this;

  this._config = assign({}, DEFAULT_CONFIG, config || {});

  keyboard.addListener(HIGHER_PRIORITY, function(event) {

    var keyEvent = event.keyEvent;

    var direction = KEY_TO_DIRECTION[keyEvent.key];

    if (!direction) {
      return;
    }

    if (keyboard.isCmd(keyEvent)) {
      return;
    }

    var accelerated = keyboard.isShift(keyEvent);

    self.moveSelection(direction, accelerated);

    return true;
  });


  /**
   * Move selected elements in the given direction,
   * optionally specifying accelerated movement.
   *
   * @param {String} direction
   * @param {Boolean} [accelerated=false]
   */
  this.moveSelection = function(direction, accelerated) {

    var selectedElements = selection.get();

    if (!selectedElements.length) {
      return;
    }

    var speed = this._config[
      accelerated ?
        'moveSpeedAccelerated' :
        'moveSpeed'
    ];

    var delta = DIRECTIONS_DELTA[direction](speed);

    modeling.moveElements(selectedElements, delta);
  };

}

KeyboardMoveSelection.$inject = [
  'config.keyboardMoveSelection',
  'keyboard',
  'modeling',
  'selection'
];