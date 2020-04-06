import {
  assign,
  forEach,
  isFunction,
  isDefined,
  omit,
  size
} from 'min-dash';

import {
  delegate as domDelegate,
  domify as domify,
  classes as domClasses,
  attr as domAttr,
  remove as domRemove
} from 'min-dom';

var DATA_REF = 'data-id';

var CLOSE_EVENTS = [
  'contextPad.close',
  'canvas.viewbox.changing',
  'commandStack.changed'
];

var DEFAULT_PRIORITY = 1000;


/**
 * A popup menu that can be used to display a list of actions anywhere in the canvas.
 *
 * @param {Object} config
 * @param {boolean|Object} [config.scale={ min: 1.0, max: 1.5 }]
 * @param {number} [config.scale.min]
 * @param {number} [config.scale.max]
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 *
 * @class
 * @constructor
 */
export default function PopupMenu(config, eventBus, canvas) {

  var scale = isDefined(config && config.scale) ? config.scale : {
    min: 1,
    max: 1.5
  };

  this._config = {
    scale: scale
  };

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._providers = {};
  this._current = {};
}

PopupMenu.$inject = [
  'config.popupMenu',
  'eventBus',
  'canvas'
];

/**
 * Registers a popup menu provider
 *
 * @param  {string} id
 * @param {number} [priority=1000]
 * @param  {Object} provider
 *
 * @example
 * const popupMenuProvider = {
 *   getPopupMenuEntries: function(element) {
 *     return {
 *       'entry-1': {
 *         label: 'My Entry',
 *         action: function() { alert("I have been clicked!"); }
 *       }
 *     }
 *   }
 * };
 *
 * popupMenu.registerProvider('myMenuID', popupMenuProvider);
 */
PopupMenu.prototype.registerProvider = function(id, priority, provider) {
  if (!provider) {
    provider = priority;
    priority = DEFAULT_PRIORITY;
  }

  this._eventBus.on('popupMenu.getProviders.' + id, priority, function(event) {
    event.providers.push(provider);
  });
};

/**
 * Determine if the popup menu has entries.
 *
 * @return {boolean} true if empty
 */
PopupMenu.prototype.isEmpty = function(element, providerId) {
  if (!element) {
    throw new Error('element parameter is missing');
  }

  if (!providerId) {
    throw new Error('providerId parameter is missing');
  }

  var providers = this._getProviders(providerId);

  if (!providers) {
    return true;
  }

  var entries = this._getEntries(element, providers),
      headerEntries = this._getHeaderEntries(element, providers);

  var hasEntries = size(entries) > 0,
      hasHeaderEntries = headerEntries && size(headerEntries) > 0;

  return !hasEntries && !hasHeaderEntries;
};


/**
 * Create entries and open popup menu at given position
 *
 * @param  {Object} element
 * @param  {string} id provider id
 * @param  {Object} position
 *
 * @return {Object} popup menu instance
 */
PopupMenu.prototype.open = function(element, id, position) {

  var providers = this._getProviders(id);

  if (!element) {
    throw new Error('Element is missing');
  }

  if (!providers || !providers.length) {
    throw new Error('No registered providers for: ' + id);
  }

  if (!position) {
    throw new Error('the position argument is missing');
  }

  if (this.isOpen()) {
    this.close();
  }

  this._emit('open');

  var current = this._current = {
    className: id,
    element: element,
    position: position
  };

  var entries = this._getEntries(element, providers),
      headerEntries = this._getHeaderEntries(element, providers);

  current.entries = assign({}, entries, headerEntries);

  current.container = this._createContainer();

  if (size(headerEntries)) {
    current.container.appendChild(
      this._createEntries(headerEntries, 'djs-popup-header')
    );
  }

  if (size(entries)) {
    current.container.appendChild(
      this._createEntries(entries, 'djs-popup-body')
    );
  }

  var canvas = this._canvas,
      parent = canvas.getContainer();

  this._attachContainer(current.container, parent, position.cursor);
  this._bindAutoClose();
};


/**
 * Removes the popup menu and unbinds the event handlers.
 */
PopupMenu.prototype.close = function() {

  if (!this.isOpen()) {
    return;
  }

  this._emit('close');

  this._unbindAutoClose();
  domRemove(this._current.container);
  this._current.container = null;
};


/**
 * Determine if an open popup menu exist.
 *
 * @return {boolean} true if open
 */
PopupMenu.prototype.isOpen = function() {
  return !!this._current.container;
};


/**
 * Trigger an action associated with an entry.
 *
 * @param {Object} event
 *
 * @return the result of the action callback, if any
 */
PopupMenu.prototype.trigger = function(event) {

  // silence other actions
  event.preventDefault();

  var element = event.delegateTarget || event.target,
      entryId = domAttr(element, DATA_REF);

  var entry = this._getEntry(entryId);

  if (entry.action) {
    return entry.action.call(null, event, entry);
  }
};

PopupMenu.prototype._getProviders = function(id) {

  var event = this._eventBus.createEvent({
    type: 'popupMenu.getProviders.' + id,
    providers: []
  });

  this._eventBus.fire(event);

  return event.providers;
};

PopupMenu.prototype._getEntries = function(element, providers) {

  var entries = {};

  forEach(providers, function(provider) {

    // handle legacy method
    if (!provider.getPopupMenuEntries) {
      forEach(provider.getEntries(element), function(entry) {
        var id = entry.id;

        if (!id) {
          throw new Error('every entry must have the id property set');
        }

        entries[id] = omit(entry, [ 'id' ]);
      });

      return;
    }

    var entriesOrUpdater = provider.getPopupMenuEntries(element);

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

PopupMenu.prototype._getHeaderEntries = function(element, providers) {

  var entries = {};

  forEach(providers, function(provider) {

    // handle legacy method
    if (!provider.getPopupMenuHeaderEntries) {
      if (!provider.getHeaderEntries) {
        return;
      }

      forEach(provider.getHeaderEntries(element), function(entry) {
        var id = entry.id;

        if (!id) {
          throw new Error('every entry must have the id property set');
        }

        entries[id] = omit(entry, [ 'id' ]);
      });

      return;
    }

    var entriesOrUpdater = provider.getPopupMenuHeaderEntries(element);

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
 * Gets an entry instance (either entry or headerEntry) by id.
 *
 * @param  {string} entryId
 *
 * @return {Object} entry instance
 */
PopupMenu.prototype._getEntry = function(entryId) {

  var entry = this._current.entries[entryId];

  if (!entry) {
    throw new Error('entry not found');
  }

  return entry;
};

PopupMenu.prototype._emit = function(eventName) {
  this._eventBus.fire('popupMenu.' + eventName);
};

/**
 * Creates the popup menu container.
 *
 * @return {Object} a DOM container
 */
PopupMenu.prototype._createContainer = function() {
  var container = domify('<div class="djs-popup">'),
      position = this._current.position,
      className = this._current.className;

  assign(container.style, {
    position: 'absolute',
    left: position.x + 'px',
    top: position.y + 'px',
    visibility: 'hidden'
  });

  domClasses(container).add(className);

  return container;
};


/**
 * Attaches the container to the DOM.
 *
 * @param {Object} container
 * @param {Object} parent
 */
PopupMenu.prototype._attachContainer = function(container, parent, cursor) {
  var self = this;

  // Event handler
  domDelegate.bind(container, '.entry' ,'click', function(event) {
    self.trigger(event);
  });

  this._updateScale(container);

  // Attach to DOM
  parent.appendChild(container);

  if (cursor) {
    this._assureIsInbounds(container, cursor);
  }
};


/**
 * Updates popup style.transform with respect to the config and zoom level.
 *
 * @method _updateScale
 *
 * @param {Object} container
 */
PopupMenu.prototype._updateScale = function(container) {
  var zoom = this._canvas.zoom();

  var scaleConfig = this._config.scale,
      minScale,
      maxScale,
      scale = zoom;

  if (scaleConfig !== true) {

    if (scaleConfig === false) {
      minScale = 1;
      maxScale = 1;
    } else {
      minScale = scaleConfig.min;
      maxScale = scaleConfig.max;
    }

    if (isDefined(minScale) && zoom < minScale) {
      scale = minScale;
    }

    if (isDefined(maxScale) && zoom > maxScale) {
      scale = maxScale;
    }

  }

  setTransform(container, 'scale(' + scale + ')');
};


/**
 * Make sure that the menu is always fully shown
 *
 * @method function
 *
 * @param  {Object} container
 * @param  {Position} cursor {x, y}
 */
PopupMenu.prototype._assureIsInbounds = function(container, cursor) {
  var canvas = this._canvas,
      clientRect = canvas._container.getBoundingClientRect();

  var containerX = container.offsetLeft,
      containerY = container.offsetTop,
      containerWidth = container.scrollWidth,
      containerHeight = container.scrollHeight,
      overAxis = {},
      left, top;

  var cursorPosition = {
    x: cursor.x - clientRect.left,
    y: cursor.y - clientRect.top
  };

  if (containerX + containerWidth > clientRect.width) {
    overAxis.x = true;
  }

  if (containerY + containerHeight > clientRect.height) {
    overAxis.y = true;
  }

  if (overAxis.x && overAxis.y) {
    left = cursorPosition.x - containerWidth + 'px';
    top = cursorPosition.y - containerHeight + 'px';
  } else if (overAxis.x) {
    left = cursorPosition.x - containerWidth + 'px';
    top = cursorPosition.y + 'px';
  } else if (overAxis.y && cursorPosition.y < containerHeight) {
    left = cursorPosition.x + 'px';
    top = 10 + 'px';
  } else if (overAxis.y) {
    left = cursorPosition.x + 'px';
    top = cursorPosition.y - containerHeight + 'px';
  }

  assign(container.style, { left: left, top: top }, { visibility: 'visible', 'z-index': 1000 });
};


/**
 * Creates a list of entries and returns them as a DOM container.
 *
 * @param {Array<Object>} entries an array of entry objects
 * @param {string} className the class name of the entry container
 *
 * @return {Object} a DOM container
 */
PopupMenu.prototype._createEntries = function(entries, className) {

  var entriesContainer = domify('<div>'),
      self = this;

  domClasses(entriesContainer).add(className);

  forEach(entries, function(entry, id) {
    var entryContainer = self._createEntry(entry, id);
    entriesContainer.appendChild(entryContainer);
  });

  return entriesContainer;
};


/**
 * Creates a single entry and returns it as a DOM container.
 *
 * @param  {Object} entry
 *
 * @return {Object} a DOM container
 */
PopupMenu.prototype._createEntry = function(entry, id) {

  var entryContainer = domify('<div>'),
      entryClasses = domClasses(entryContainer);

  entryClasses.add('entry');

  if (entry.className) {
    entry.className.split(' ').forEach(function(className) {
      entryClasses.add(className);
    });
  }

  domAttr(entryContainer, DATA_REF, id);

  if (entry.label) {
    var label = domify('<span>');
    label.textContent = entry.label;
    entryContainer.appendChild(label);
  }

  if (entry.imageUrl) {
    entryContainer.appendChild(domify('<img src="' + entry.imageUrl + '" />'));
  }

  if (entry.active === true) {
    entryClasses.add('active');
  }

  if (entry.disabled === true) {
    entryClasses.add('disabled');
  }

  if (entry.title) {
    entryContainer.title = entry.title;
  }

  return entryContainer;
};


/**
 * Set up listener to close popup automatically on certain events.
 */
PopupMenu.prototype._bindAutoClose = function() {
  this._eventBus.once(CLOSE_EVENTS, this.close, this);
};


/**
 * Remove the auto-closing listener.
 */
PopupMenu.prototype._unbindAutoClose = function() {
  this._eventBus.off(CLOSE_EVENTS, this.close, this);
};



// helpers /////////////////////////////

function setTransform(element, transform) {
  element.style['transform-origin'] = 'top left';

  [ '', '-ms-', '-webkit-' ].forEach(function(prefix) {
    element.style[prefix + 'transform'] = transform;
  });
}