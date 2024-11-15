import {
  isFunction
} from 'min-dash';

import {
  event as domEvent
} from 'min-dom';

import {
  hasModifier,
  isCmd,
  isKey,
  isShift
} from './KeyboardUtil';

/**
 * @typedef {import('../../core/EventBus').default} EventBus
 *
 * @typedef {({ keyEvent: KeyboardEvent }) => any} Listener
 */

var KEYDOWN_EVENT = 'keyboard.keydown',
    KEYUP_EVENT = 'keyboard.keyup';

var DEFAULT_PRIORITY = 1000;

var compatMessage = 'Keyboard binding is now implicit; explicit binding to an element got removed. For more information, see https://github.com/bpmn-io/diagram-js/issues/661';


/**
 * A keyboard abstraction that may be activated and
 * deactivated by users at will, consuming global key events
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
 * Specify the initial keyboard binding state via the
 * `keyboard.bind=true|false` configuration option.
 *
 * @param {Object} config
 * @param {boolean} [config.bind]
 * @param {EventBus} eventBus
 */
export default function Keyboard(config, eventBus) {
  var self = this;

  this._config = config = config || {};

  this._eventBus = eventBus;

  this._keydownHandler = this._keydownHandler.bind(this);
  this._keyupHandler = this._keyupHandler.bind(this);

  // properly clean dom registrations
  eventBus.on('diagram.destroy', function() {
    self._fire('destroy');

    self.unbind();
  });

  if (config.bindTo) {
    console.error('unsupported configuration <keyboard.bindTo>', new Error(compatMessage));
  }

  var bind = config && config.bind !== false;

  eventBus.on('canvas.init', function(event) {
    self._target = event.svg;

    if (bind) {
      self.bind();
    }

    self._fire('init');
  });

}

Keyboard.$inject = [
  'config.keyboard',
  'eventBus'
];

Keyboard.prototype._keydownHandler = function(event) {
  this._keyHandler(event, KEYDOWN_EVENT);
};

Keyboard.prototype._keyupHandler = function(event) {
  this._keyHandler(event, KEYUP_EVENT);
};

Keyboard.prototype._keyHandler = function(event, type) {
  var eventBusResult;

  if (this._isEventIgnored(event)) {
    return;
  }

  var context = {
    keyEvent: event
  };

  eventBusResult = this._eventBus.fire(type || KEYDOWN_EVENT, context);

  if (eventBusResult) {
    event.preventDefault();
  }
};

Keyboard.prototype._isEventIgnored = function(event) {
  return false;
};

/**
 * Bind keyboard events to the given DOM node.
 *
 * @overlord
 * @deprecated No longer in use since version 15.0.0.
 *
 * @param {EventTarget} node
 */
/**
 * Bind keyboard events to the canvas node.
 */
Keyboard.prototype.bind = function(node) {

  // legacy <node> argument provided
  if (node) {
    console.error('unsupported argument <node>', new Error(compatMessage));
  }

  // make sure that the keyboard is only bound once to the DOM
  this.unbind();

  node = this._node = this._target;

  // bind key events
  domEvent.bind(node, 'keydown', this._keydownHandler);
  domEvent.bind(node, 'keyup', this._keyupHandler);

  this._fire('bind');
};

/**
 * @return {EventTarget}
 */
Keyboard.prototype.getBinding = function() {
  return this._node;
};

Keyboard.prototype.unbind = function() {
  var node = this._node;

  if (node) {
    this._fire('unbind');

    // unbind key events
    domEvent.unbind(node, 'keydown', this._keydownHandler);
    domEvent.unbind(node, 'keyup', this._keyupHandler);
  }

  this._node = null;
};

/**
 * @param {string} event
 */
Keyboard.prototype._fire = function(event) {
  this._eventBus.fire('keyboard.' + event, { node: this._node });
};

/**
 * Add a listener function that is notified with `KeyboardEvent` whenever
 * the keyboard is bound and the user presses a key. If no priority is
 * provided, the default value of 1000 is used.
 *
 * @param {number} [priority]
 * @param {Listener} listener
 * @param {string} [type='keyboard.keydown']
 */
Keyboard.prototype.addListener = function(priority, listener, type) {
  if (isFunction(priority)) {
    type = listener;
    listener = priority;
    priority = DEFAULT_PRIORITY;
  }

  this._eventBus.on(type || KEYDOWN_EVENT, priority, listener);
};

/**
 * Remove a listener function.
 *
 * @param {Listener} listener
 * @param {string} [type='keyboard.keydown']
 */
Keyboard.prototype.removeListener = function(listener, type) {
  this._eventBus.off(type || KEYDOWN_EVENT, listener);
};

Keyboard.prototype.hasModifier = hasModifier;
Keyboard.prototype.isCmd = isCmd;
Keyboard.prototype.isShift = isShift;
Keyboard.prototype.isKey = isKey;
