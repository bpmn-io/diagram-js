import {
  isFunction
} from 'min-dash';

import {
  event as domEvent,
  matches as domMatches
} from 'min-dom';

import {
  hasModifier,
  isCmd,
  isKey,
  isShift
} from './KeyboardUtil';

var KEYDOWN_EVENT = 'keyboard.keydown';

var DEFAULT_PRIORITY = 1000;


/**
 * A keyboard abstraction that may be activated and
 * deactivated by users at will, consuming key events
 * and triggering diagram actions.
 *
 * For keys pressed down, keyboard fires `keyboard.keydown` event.
 * The event context contains one field which is `KeyboardEvent` event.
 *
 * The implementation fires the following key events that allow
 * other components to hook into key handling:
 *
 *  - keyboard.bind
 *  - keyboard.unbind
 *  - keyboard.init
 *  - keyboard.destroy
 *
 * All events contain one field which is node.
 *
 * A default binding for the keyboard may be specified via the
 * `keyboard.bindTo` configuration option.
 *
 * @param {Config} config
 * @param {EventBus} eventBus
 */
export default function Keyboard(config, eventBus) {
  var self = this;

  this._config = config || {};
  this._eventBus = eventBus;

  this._keyHandler = this._keyHandler.bind(this);

  // properly clean dom registrations
  eventBus.on('diagram.destroy', function() {
    self._fire('destroy');

    self.unbind();
  });

  eventBus.on('diagram.init', function() {
    self._fire('init');
  });

  eventBus.on('attach', function() {
    if (config && config.bindTo) {
      self.bind(config.bindTo);
    }
  });

  eventBus.on('detach', function() {
    self.unbind();
  });
}

Keyboard.$inject = [
  'config.keyboard',
  'eventBus'
];

Keyboard.prototype._keyHandler = function(event) {

  var target = event.target,
      eventBusResult;

  if (isInput(target)) {
    return;
  }

  var context = {
    keyEvent: event
  };

  eventBusResult = this._eventBus.fire(KEYDOWN_EVENT, context);

  if (eventBusResult) {
    event.preventDefault();
  }
};

Keyboard.prototype.bind = function(node) {

  // make sure that the keyboard is only bound once to the DOM
  this.unbind();

  this._node = node;

  // bind key events
  domEvent.bind(node, 'keydown', this._keyHandler, true);

  this._fire('bind');
};

Keyboard.prototype.getBinding = function() {
  return this._node;
};

Keyboard.prototype.unbind = function() {
  var node = this._node;

  if (node) {
    this._fire('unbind');

    // unbind key events
    domEvent.unbind(node, 'keydown', this._keyHandler, true);
  }

  this._node = null;
};

Keyboard.prototype._fire = function(event) {
  this._eventBus.fire('keyboard.' + event, { node: this._node });
};

/**
 * Add a listener function that is notified with `KeyboardEvent` whenever
 * the keyboard is bound and the user presses a key. If no priority is
 * provided, the default value of 1000 is used.
 *
 * @param {Number} priority
 * @param {Function} listener
 */
Keyboard.prototype.addListener = function(priority, listener) {
  if (isFunction(priority)) {
    listener = priority;
    priority = DEFAULT_PRIORITY;
  }

  this._eventBus.on(KEYDOWN_EVENT, priority, listener);
};

Keyboard.prototype.hasModifier = hasModifier;
Keyboard.prototype.isCmd = isCmd;
Keyboard.prototype.isShift = isShift;
Keyboard.prototype.isKey = isKey;



// helpers ///////

function isInput(target) {
  return target && (domMatches(target, 'input, textarea') || target.contentEditable === 'true');
}
