import {
  render,
  html
} from '../../ui';

import {
  domify,
  remove as domRemove,
  closest as domClosest,
  attr as domAttr
} from 'min-dom';

import {
  forEach,
  isFunction,
  omit,
  isDefined
} from 'min-dash';

import PopupMenuComponent from './PopupMenuComponent';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/EventBus').default} EventBus
 */

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
  this._eventBus = eventBus;
  this._canvas = canvas;

  this._current = null;

  var scale = isDefined(config && config.scale) ? config.scale : {
    min: 1,
    max: 1.5
  };

  this._config = {
    scale: scale
  };


  eventBus.on('diagram.destroy', () => {
    this.close();
  });

  eventBus.on('element.changed', event => {

    const element = this.isOpen() && this._current.element;

    if (event.element === element) {
      this._render();
    }
  });

}

PopupMenu.$inject = [
  'config.popupMenu',
  'eventBus',
  'canvas'
];

PopupMenu.prototype._render = function() {

  const {
    position: _position,
    className,
    entries,
    headerEntries,
    options
  } = this._current;

  const entriesArray = Object.entries(entries).map(
    ([ key, value ]) => ({ id: key, ...value })
  );

  const headerEntriesArray = Object.entries(headerEntries).map(
    ([ key, value ]) => ({ id: key, ...value })
  );

  const position = _position && (
    (container) => this._ensureVisible(container, _position)
  );

  const scale = this._updateScale(this._current.container);

  const onClose = result => this.close(result);
  const onSelect = (event, entry, action) => this.trigger(event, entry, action);

  render(
    html`
      <${PopupMenuComponent}
        onClose=${ onClose }
        onSelect=${ onSelect }
        position=${ position }
        className=${ className }
        entries=${ entriesArray }
        headerEntries=${ headerEntriesArray }
        scale=${ scale }
        onOpened=${ this._onOpened.bind(this) }
        onClosed=${ this._onClosed.bind(this) }
        ...${{ ...options }}
      />
    `,
    this._current.container
  );
};


/**
 * Create entries and open popup menu at given position
 *
 * @param {Object} element
 * @param {string} id provider id
 * @param {Object} position
 *
 * @return {Object} popup menu instance
 */
PopupMenu.prototype.open = function(element, providerId, position, options) {
  if (!element) {
    throw new Error('Element is missing');
  }

  if (!providerId) {
    throw new Error('No registered providers for: ' + providerId);
  }

  if (!position) {
    throw new Error('the position argument is missing');
  }

  if (this.isOpen()) {
    this.close();
  }

  const {
    entries,
    headerEntries
  } = this._getContext(element, providerId);

  this._current = {
    position,
    className: providerId,
    element,
    entries,
    headerEntries,
    container: this._createContainer({ provider: providerId }),
    options
  };

  this._emit('open');

  this._bindAutoClose();

  this._render();
};


PopupMenu.prototype._getContext = function(element, provider) {

  const providers = this._getProviders(provider);

  if (!providers || !providers.length) {
    throw new Error('No registered providers for: ' + provider);
  }

  const entries = this._getEntries(element, providers);
  const headerEntries = this._getHeaderEntries(element, providers);

  return {
    entries,
    headerEntries,
    empty: !(
      Object.keys(entries).length ||
          Object.keys(headerEntries).length
    )
  };
};

PopupMenu.prototype.close = function() {

  if (!this.isOpen()) {
    return;
  }

  this._emit('close');

  this.reset();

  this._current = null;
};

PopupMenu.prototype.reset = function() {
  const container = this._current.container;

  render(null, container);

  domRemove(container);
};

PopupMenu.prototype._emit = function(event, payload) {
  this._eventBus.fire(`popupMenu.${ event }`, payload);
};

PopupMenu.prototype._onOpened = function() {
  this._emit('opened');
};

PopupMenu.prototype._onClosed = function() {
  this._emit('closed');
};

PopupMenu.prototype._createContainer = function(config) {

  var canvas = this._canvas,
      parent = canvas.getContainer();

  const container = domify(`<div class="djs-popup-parent djs-scrollable" data-popup=${config.provider}></div>`);

  parent.appendChild(container);

  return container;
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


/**
 * Updates popup style.transform with respect to the config and zoom level.
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

  return scale;

};

PopupMenu.prototype._ensureVisible = function(container, position) {
  var documentBounds = document.documentElement.getBoundingClientRect();
  var containerBounds = container.getBoundingClientRect();

  var overAxis = {},
      left = position.x,
      top = position.y;

  if (position.x + containerBounds.width > documentBounds.width) {
    overAxis.x = true;
  }

  if (position.y + containerBounds.height > documentBounds.height) {
    overAxis.y = true;
  }

  if (overAxis.x && overAxis.y) {
    left = position.x - containerBounds.width;
    top = position.y - containerBounds.height;
  } else if (overAxis.x) {
    left = position.x - containerBounds.width;
    top = position.y;
  } else if (overAxis.y && position.y < containerBounds.height) {
    left = position.x;
    top = 10;
  } else if (overAxis.y) {
    left = position.x;
    top = position.y - containerBounds.height;
  }

  return {
    x: left,
    y: top
  };
};

PopupMenu.prototype.isEmpty = function(element, providerId) {
  if (!element) {
    throw new Error('element parameter is missing');
  }

  if (!providerId) {
    throw new Error('providerId parameter is missing');
  }

  const providers = this._getProviders(providerId);

  if (!providers || !providers.length) {
    return true;
  }

  return this._getContext(element, providerId).empty;
};

/**
 * Registers a popup menu provider
 *
 * @param {string} id
 * @param {number} [priority=1000]
 * @param {Object} provider
 *
 * @example
 * const popupMenuProvider = {
 *   getPopupMenuEntries(element) {
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
 *
 * @example
 * const replacingPopupMenuProvider = {
 *   getPopupMenuEntries(element) {
 *     return (entries) => {
 *       const {
 *         someEntry,
 *         ...remainingEntries
 *       } = entries;
 *
 *       return remainingEntries;
 *     };
 *   }
 * };
 *
 * popupMenu.registerProvider('myMenuID', replacingPopupMenuProvider);
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
 * Determine if an open popup menu exist.
 *
 * @return {boolean} true if open
 */
PopupMenu.prototype.isOpen = function() {
  return !!this._current;
};


/**
 * Trigger an action associated with an entry.
 *
 * @param {Object} event
 * @param {Object} entry
 * @param {string} [action='click'] the action to trigger
 *
 * @return the result of the action callback, if any
 */
PopupMenu.prototype.trigger = function(event, entry, action = 'click') {

  // silence other actions
  event.preventDefault();

  if (!entry) {
    let element = domClosest(event.delegateTarget || event.target, '.entry', true);
    let entryId = domAttr(element, DATA_REF);

    entry = this._getEntry(entryId);
  }

  const handler = entry.action;

  if (this._emit('trigger', { entry, event }) === false) {
    return;
  }

  if (isFunction(handler)) {
    if (action === 'click') {
      return handler(event, entry);
    }
  } else {
    if (handler[action]) {
      return handler[action](event, entry);
    }
  }
};

/**
 * Gets an entry instance (either entry or headerEntry) by id.
 *
 * @param {string} entryId
 *
 * @return {Object} entry instance
 */
PopupMenu.prototype._getEntry = function(entryId) {

  var entry = this._current.entries[entryId] || this._current.headerEntries[entryId];


  if (!entry) {
    throw new Error('entry not found');
  }

  return entry;
};