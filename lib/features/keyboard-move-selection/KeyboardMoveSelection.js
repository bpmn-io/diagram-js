import {
  assign
} from 'min-dash';


var DEFAULT_CONFIG = {
  moveSpeed: 1,
  moveSpeedAccelerated: 10
};

var HIGHER_PRIORITY = 1500;

var KEYS = {
  LEFT: ['ArrowLeft', 'Left'],
  UP: ['ArrowUp', 'Up'],
  RIGHT: ['ArrowRight', 'Right'],
  DOWN: ['ArrowDown', 'Down']
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
export default function MoveSelection(config, keyboard, modeling, selection) {

  var self = this;

  this._config = assign({}, DEFAULT_CONFIG, config || {});

  keyboard.addListener(HIGHER_PRIORITY, moveAction(KEYS.LEFT, moveLeft));
  keyboard.addListener(HIGHER_PRIORITY, moveAction(KEYS.UP, moveUp));
  keyboard.addListener(HIGHER_PRIORITY, moveAction(KEYS.RIGHT, moveRight));
  keyboard.addListener(HIGHER_PRIORITY, moveAction(KEYS.DOWN, moveDown));

  /**
   * Returns `KeyboardEvent` listener which moves selection according to provided getDelta function.
   *
   * @param {string} keys - array of keys to listen for
   * @param {Function} getDelta - function which returns coordinates delta for provided speed
   */
  function moveAction(keys, getDelta) {

    return function(context) {

      var event = context.event;

      if (!keyboard.isKey(keys, event)) {
        return;
      }

      if (keyboard.isCmd(event)) {
        return;
      }

      var selectedElements = selection.get();

      if (!selectedElements.length) {
        return;
      }

      var speed = getSpeed(event, self._config);

      var coordinatesDelta = getDelta(speed);

      modeling.moveElements(selectedElements, coordinatesDelta);

      return true;
    };
  }

  function getSpeed(event) {
    if (keyboard.isShift(event)) {
      return self._config.moveSpeedAccelerated;
    }

    return self._config.moveSpeed;
  }
}

MoveSelection.$inject = [
  'config.keyboardMoveSelection',
  'keyboard',
  'modeling',
  'selection'
];



// helpers /////////

function moveLeft(speed) {
  return {
    x: -speed,
    y: 0
  };
}

function moveUp(speed) {
  return {
    x: 0,
    y: -speed
  };
}

function moveRight(speed) {
  return {
    x: speed,
    y: 0
  };
}

function moveDown(speed) {
  return {
    x: 0,
    y: +speed
  };
}
