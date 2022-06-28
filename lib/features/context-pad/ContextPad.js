import {
  assign,
  every,
  forEach,
  isArray,
  isDefined,
  isFunction,
  some
} from 'min-dash';

import {
  delegate as domDelegate,
  event as domEvent,
  attr as domAttr,
  query as domQuery,
  classes as domClasses,
  domify as domify
} from 'min-dom';

import { getBBox } from '../../util/Elements';

import {
  escapeCSS
} from '../../util/EscapeUtil';

var entrySelector = '.entry';

var DEFAULT_PRIORITY = 1000;
var CONTEXT_PAD_PADDING = 12;


/**
 * @typedef {djs.model.Base|djs.model.Base[]} ContextPadTarget
 */

/**
 * A context pad that displays element specific, contextual actions next
 * to a diagram element.
 *
 * @param {Canvas} canvas
 * @param {Object} config
 * @param {boolean|Object} [config.scale={ min: 1.0, max: 1.5 }]
 * @param {number} [config.scale.min]
 * @param {number} [config.scale.max]
 * @param {EventBus} eventBus
 * @param {Overlays} overlays
 */
export default function ContextPad(canvas, config, eventBus, overlays) {

  this._canvas = canvas;
  this._eventBus = eventBus;
  this._overlays = overlays;

  var scale = isDefined(config && config.scale) ? config.scale : {
    min: 1,
    max: 1.5
  };

  this._overlaysConfig = {
    scale: scale
  };

  this._current = null;

  this._init();
}

ContextPad.$inject = [
  'canvas',
  'config.contextPad',
  'eventBus',
  'overlays'
];


/**
 * Registers events needed for interaction with other components.
 */
ContextPad.prototype._init = function() {
  var self = this;

  this._eventBus.on('selection.changed', function(event) {

    var selection = event.newSelection;

    var target = selection.length
      ? selection.length === 1
        ? selection[0]
        : selection
      : null;

    if (target) {
      self.open(target, true);
    } else {
      self.close();
    }
  });

  this._eventBus.on('elements.changed', function(event) {
    var elements = event.elements,
        current = self._current;

    if (!current) {
      return;
    }

    var currentTarget = current.target;

    var currentChanged = some(
      isArray(currentTarget) ? currentTarget : [ currentTarget ],
      function(element) {
        return includes(elements, element);
      }
    );

    // re-open if elements in current selection changed
    if (currentChanged) {
      self.open(currentTarget, true);
    }
  });
};


/**
 * Register context pad provider.
 *
 * @param  {number} [priority=1000]
 * @param  {ContextPadProvider} provider
 *
 * @example
 * const contextPadProvider = {
 *   getContextPadEntries: function(element) {
 *     return function(entries) {
 *       return {
 *         ...entries,
 *         'entry-1': {
 *           label: 'My Entry',
 *           action: function() { alert("I have been clicked!"); }
 *         }
 *       };
 *     }
 *   },
 *
 *   getMultiElementContextPadEntries: function(elements) {
 *     // ...
 *   }
 * };
 *
 * contextPad.registerProvider(800, contextPadProvider);
 */
ContextPad.prototype.registerProvider = function(priority, provider) {
  if (!provider) {
    provider = priority;
    priority = DEFAULT_PRIORITY;
  }

  this._eventBus.on('contextPad.getProviders', priority, function(event) {
    event.providers.push(provider);
  });
};


/**
 * Get context pad entries for given elements.
 *
 * @param {ContextPadTarget} target
 *
 * @return {ContextPadEntryDescriptor[]} list of entries
 */
ContextPad.prototype.getEntries = function(target) {
  var providers = this._getProviders();

  var provideFn = isArray(target)
    ? 'getMultiElementContextPadEntries'
    : 'getContextPadEntries';

  var entries = {};

  // loop through all providers and their entries.
  // group entries by id so that overriding an entry is possible
  forEach(providers, function(provider) {

    if (!isFunction(provider[provideFn])) {
      return;
    }

    var entriesOrUpdater = provider[provideFn](target);

    if (isFunction(entriesOrUpdater)) {
      entries = entriesOrUpdater(entries);
    } else {
      forEach(entriesOrUpdater, function(entry, id) {
        entries[id] = entry;
      });
    }
  });

  return entries;
};


/**
 * Trigger context pad action.
 *
 * @param  {string} action
 * @param  {Event} event
 * @param  {boolean} [autoActivate=false]
 */
ContextPad.prototype.trigger = function(action, event, autoActivate) {

  var target = this._current.target,
      entries = this._current.entries,
      entry,
      handler,
      originalEvent,
      button = event.delegateTarget || event.target;

  if (!button) {
    return event.preventDefault();
  }

  entry = entries[domAttr(button, 'data-action')];
  handler = entry.action;

  originalEvent = event.originalEvent || event;

  // simple action (via callback function)
  if (isFunction(handler)) {
    if (action === 'click') {
      return handler(originalEvent, target, autoActivate);
    }
  } else {
    if (handler[action]) {
      return handler[action](originalEvent, target, autoActivate);
    }
  }

  // silence other actions
  event.preventDefault();
};


/**
 * Open the context pad for given elements.
 *
 * @param {ContextPadTarget} target
 * @param {boolean} [force=false] - Force re-opening context pad.
 */
ContextPad.prototype.open = function(target, force) {
  if (!force && this.isOpen(target)) {
    return;
  }

  this.close();

  this._updateAndOpen(target);
};

ContextPad.prototype._getProviders = function() {

  var event = this._eventBus.createEvent({
    type: 'contextPad.getProviders',
    providers: []
  });

  this._eventBus.fire(event);

  return event.providers;
};


/**
 * @param {ContextPadTarget} target
 */
ContextPad.prototype._updateAndOpen = function(target) {
  var entries = this.getEntries(target),
      pad = this.getPad(target),
      html = pad.html,
      image;

  forEach(entries, function(entry, id) {
    var grouping = entry.group || 'default',
        control = domify(entry.html || '<div class="entry" draggable="true"></div>'),
        container;

    domAttr(control, 'data-action', id);

    container = domQuery('[data-group=' + escapeCSS(grouping) + ']', html);
    if (!container) {
      container = domify('<div class="group"></div>');
      domAttr(container, 'data-group', grouping);

      html.appendChild(container);
    }

    container.appendChild(control);

    if (entry.className) {
      addClasses(control, entry.className);
    }

    if (entry.title) {
      domAttr(control, 'title', entry.title);
    }

    if (entry.imageUrl) {
      image = domify('<img>');
      domAttr(image, 'src', entry.imageUrl);
      image.style.width = '100%';
      image.style.height = '100%';

      control.appendChild(image);
    }
  });

  domClasses(html).add('open');

  this._current = {
    target: target,
    entries: entries,
    pad: pad
  };

  this._eventBus.fire('contextPad.open', { current: this._current });
};

/**
 * @param {ContextPadTarget} target
 *
 * @return {Overlay}
 */
ContextPad.prototype.getPad = function(target) {
  if (this.isOpen()) {
    return this._current.pad;
  }

  var self = this;

  var overlays = this._overlays;

  var html = domify('<div class="djs-context-pad"></div>');

  var position = this._getPosition(target);

  var overlaysConfig = assign({
    html: html
  }, this._overlaysConfig, position);

  domDelegate.bind(html, entrySelector, 'click', function(event) {
    self.trigger('click', event);
  });

  domDelegate.bind(html, entrySelector, 'dragstart', function(event) {
    self.trigger('dragstart', event);
  });

  // stop propagation of mouse events
  domEvent.bind(html, 'mousedown', function(event) {
    event.stopPropagation();
  });

  var activeRootElement = this._canvas.getRootElement();

  this._overlayId = overlays.add(activeRootElement, 'context-pad', overlaysConfig);

  var pad = overlays.get(this._overlayId);

  this._eventBus.fire('contextPad.create', {
    target: target,
    pad: pad
  });

  return pad;
};


/**
 * Close the context pad
 */
ContextPad.prototype.close = function() {
  if (!this.isOpen()) {
    return;
  }

  this._overlays.remove(this._overlayId);

  this._overlayId = null;

  this._eventBus.fire('contextPad.close', { current: this._current });

  this._current = null;
};

/**
 * Check if pad is open.
 *
 * If target is provided, check if it is opened
 * for the given target (single or multiple elements).
 *
 * @param {ContextPadTarget} [target]
 * @return {boolean}
 */
ContextPad.prototype.isOpen = function(target) {
  var current = this._current;

  if (!current) {
    return false;
  }

  // basic no-args is open check
  if (!target) {
    return true;
  }

  var currentTarget = current.target;

  // strict handling of single vs. multi-selection
  if (isArray(target) !== isArray(currentTarget)) {
    return false;
  }

  if (isArray(target)) {
    return (
      target.length === currentTarget.length &&
      every(target, function(element) {
        return includes(currentTarget, element);
      })
    );
  } else {
    return currentTarget === target;
  }
};


/**
 * Get contex pad position.
 *
 * @param {ContextPadTarget} target
 * @return {Bounds}
 */
ContextPad.prototype._getPosition = function(target) {

  var elements = isArray(target) ? target : [ target ];
  var bBox = getBBox(elements);

  return {
    position: {
      left: bBox.x + bBox.width + CONTEXT_PAD_PADDING,
      top: bBox.y - CONTEXT_PAD_PADDING / 2
    }
  };
};


// helpers //////////

function addClasses(element, classNames) {
  var classes = domClasses(element);

  classNames = isArray(classNames) ? classNames : classNames.split(/\s+/g);

  classNames.forEach(function(cls) {
    classes.add(cls);
  });
}

/**
 * @param {any[]} array
 * @param {any} item
 *
 * @return {boolean}
 */
function includes(array, item) {
  return array.indexOf(item) !== -1;
}