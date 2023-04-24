import {
  isFunction
} from 'min-dash';

import {
  closest as domClosest,
  event as domEvent,
  matches as domMatches
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

var HANDLE_MODIFIER_ATTRIBUTE = 'input-handle-modified-keys';

var DEFAULT_PRIORITY = 1000;

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
 * A default binding for the keyboard may be specified via the
 * `keyboard.bindTo` configuration option.
 *
 * @param {Object} config
 * @param {EventTarget} [config.bindTo]
 * @param {EventBus} eventBus
 */
export default function Keyboard(config, eventBus) {
  var self = this;

  this._config = config || {};
  this._eventBus = eventBus;

  this._keydownHandler = this._keydownHandler.bind(this);
  this._keyupHandler = this._keyupHandler.bind(this);

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
  if (event.defaultPrevented) {
    return true;
  }

  return isInput(event.target) && this._isModifiedKeyIgnored(event);
};

Keyboard.prototype._isModifiedKeyIgnored = function(event) {
  if (!isCmd(event)) {
    return true;
  }

  var allowedModifiers = this._getAllowedModifiers(event.target);
  return allowedModifiers.indexOf(event.key) === -1;
};

Keyboard.prototype._getAllowedModifiers = function(element) {
  var modifierContainer = domClosest(element, '[' + HANDLE_MODIFIER_ATTRIBUTE + ']', true);

  if (!modifierContainer || (this._node && !this._node.contains(modifierContainer))) {
    return [];
  }

  return modifierContainer.getAttribute(HANDLE_MODIFIER_ATTRIBUTE).split(',');
};

/**
 * Bind keyboard events to the given DOM node.
 *
 * @param {EventTarget} node
 */
Keyboard.prototype.bind = function(node) {

  // make sure that the keyboard is only bound once to the DOM
  this.unbind();

  this._node = node;

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



// helpers ///////

function isInput(target) {
  return target && (domMatches(target, 'input, textarea') || target.contentEditable === 'true');
}
