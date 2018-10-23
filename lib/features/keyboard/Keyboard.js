import {
  event as domEvent,
  matches as domMatches
} from 'min-dom';

import {
  hasModifier,
  isCmd,
  isShift
} from './helpers';


/**
 * A keyboard abstraction that may be activated and
 * deactivated by users at will, consuming key events
 * and triggering diagram actions.
 *
 * The implementation fires the following key events that allow
 * other components to hook into key handling:
 *
 *  - keyboard.bind
 *  - keyboard.unbind
 *  - keyboard.init
 *  - keyboard.destroy
 *
 * All events contain the fields (node, listeners).
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

  this._listeners = [];

  // our key handler is a singleton that passes
  // (keycode, modifiers) to each listener.
  //
  // listeners must indicate that they handled a key event
  // by returning true. This stops the event propagation.
  //
  this._keyHandler = function(event) {

    var i, l,
        target = event.target,
        listeners = self._listeners,
        code = event.keyCode || event.charCode || -1;

    if (target && (domMatches(target, 'input, textarea') || target.contentEditable === 'true')) {
      return;
    }

    for (i = 0; (l = listeners[i]); i++) {
      if (l(code, event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  // properly clean dom registrations
  eventBus.on('diagram.destroy', function() {
    self._fire('destroy');

    self.unbind();
    self._listeners = null;
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
  this._eventBus.fire('keyboard.' + event, { node: this._node, listeners: this._listeners });
};

/**
 * Add a listener function that is notified with (key, modifiers) whenever
 * the keyboard is bound and the user presses a key.
 *
 * @param {Function} listenerFn
 */
Keyboard.prototype.addListener = function(listenerFn) {
  this._listeners.push(listenerFn);
};

Keyboard.prototype.hasModifier = hasModifier;
Keyboard.prototype.isCmd = isCmd;
Keyboard.prototype.isShift = isShift;
