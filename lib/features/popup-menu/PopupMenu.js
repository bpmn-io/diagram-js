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
 *
 * @typedef {import('../../util/Types').Point} Point
 *
 * @typedef {import('./PopupMenuProvider').PopupMenuEntries} PopupMenuEntries
 * @typedef {import('./PopupMenuProvider').PopupMenuEntry} PopupMenuEntry
 * @typedef {import('./PopupMenuProvider').PopupMenuHeaderEntries} PopupMenuHeaderEntries
 * @typedef {import('./PopupMenuProvider').PopupMenuHeaderEntry} PopupMenuHeaderEntry
 * @typedef {import('./PopupMenuProvider').default} PopupMenuProvider
 *
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef { {
 *   scale?: {
 *     min?: number;
 *     max?: number;
 *   } | boolean;
 * } } PopupMenuConfig
 *
 * @typedef {Element|Element[]} PopupMenuTarget;
 */

var DATA_REF = 'data-id';

var CLOSE_EVENTS = [
  'contextPad.close',
  'canvas.viewbox.changing',
  'commandStack.changed'
];

var DEFAULT_PRIORITY = 1000;

/**
 * A popup menu to show a number of actions on the canvas.
 *
 * @param {PopupMenuConfig} config
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function PopupMenu(config, eventBus, canvas) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this._current = null;

  var scale = isDefined(config && config.scale) ? config.scale : {
    min: 1,
    max: 1
  };

  this._config = {
    scale: scale
  };


  eventBus.on('diagram.destroy', () => {
    this.close();
  });

  eventBus.on('element.changed', event => {

    const element = this.isOpen() && this._current.target;

    if (event.element === element) {
      this.refresh();
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
    providerId: className,
    entries,
    headerEntries,
    emptyPlaceholder,
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
        emptyPlaceholder=${ emptyPlaceholder }
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
 * Open the popup menu at the given position.
 *
 * @param {PopupMenuTarget} target
 * @param {string} providerId
 * @param {Point} position
 * @param {Object} [options]
 */
PopupMenu.prototype.open = function(target, providerId, position, options) {
  if (!target) {
    throw new Error('target is missing');
  }

  if (!providerId) {
    throw new Error('providers for <' + providerId + '> not found');
  }

  if (!position) {
    throw new Error('position is missing');
  }

  if (this.isOpen()) {
    this.close();
  }

  const {
    entries,
    headerEntries,
    emptyPlaceholder
  } = this._getContext(target, providerId);

  this._current = {
    position,
    providerId,
    target,
    entries,
    headerEntries,
    emptyPlaceholder,
    container: this._createContainer({ provider: providerId }),
    options
  };

  this._emit('open');

  this._bindAutoClose();

  this._render();
};

/**
 * Refresh the popup menu entries without changing the target or position.
 */
PopupMenu.prototype.refresh = function() {
  if (!this.isOpen()) {
    return;
  }

  const {
    target,
    providerId
  } = this._current;

  const {
    entries,
    headerEntries,
    emptyPlaceholder
  } = this._getContext(target, providerId);

  this._current = {
    ...this._current,
    entries,
    headerEntries,
    emptyPlaceholder
  };

  this._emit('refresh');

  this._render();
};


PopupMenu.prototype._getContext = function(target, provider) {

  const providers = this._getProviders(provider);

  if (!providers || !providers.length) {
    throw new Error('provider for <' + provider + '> not found');
  }

  const entries = this._getEntries(target, providers);

  const headerEntries = this._getHeaderEntries(target, providers);

  const emptyPlaceholder = this._getEmptyPlaceholder(providers);

  return {
    entries,
    headerEntries,
    emptyPlaceholder,
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
 * @return {number}
 */
PopupMenu.prototype._updateScale = function() {
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

  // underAxis
  if (position.y < documentBounds.top) {
    top = position.y + containerBounds.height;
  }

  return {
    x: left,
    y: top
  };
};

/**
 * Check whether there are no popup menu providers or provided entries for the
 * given target.
 *
 * @param {PopupMenuTarget} target
 * @param {string} providerId
 *
 * @return {boolean}
 */
PopupMenu.prototype.isEmpty = function(target, providerId) {
  if (!target) {
    throw new Error('target is missing');
  }

  if (!providerId) {
    throw new Error('provider ID is missing');
  }

  const providers = this._getProviders(providerId);

  if (!providers || !providers.length) {
    return true;
  }

  return this._getContext(target, providerId).empty;
};

/**
 * @overlord
 *
 * Register a popup menu provider with default priority. See
 * {@link PopupMenuProvider} for examples.
 *
 * @param {string} id
 * @param {PopupMenuProvider} provider
 */

/**
 * Register a popup menu provider with the given priority. See
 * {@link PopupMenuProvider} for examples.
 *
 * @param {string} id
 * @param {number} priority
 * @param {PopupMenuProvider} provider
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
 * @param {string} id
 *
 * @return {PopupMenuProvider[]}
 */
PopupMenu.prototype._getProviders = function(id) {
  var event = this._eventBus.createEvent({
    type: 'popupMenu.getProviders.' + id,
    providers: []
  });

  this._eventBus.fire(event);

  return event.providers;
};

/**
 * @param {PopupMenuTarget} target
 * @param {PopupMenuProvider[]} providers
 *
 * @return {PopupMenuEntries}
 */
PopupMenu.prototype._getEntries = function(target, providers) {
  var entries = {};

  forEach(providers, function(provider) {

    // handle legacy method
    if (!provider.getPopupMenuEntries) {
      forEach(provider.getEntries(target), function(entry) {
        var id = entry.id;

        if (!id) {
          throw new Error('entry ID is missing');
        }

        entries[id] = omit(entry, [ 'id' ]);
      });

      return;
    }

    var entriesOrUpdater = provider.getPopupMenuEntries(target);

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
 * @param {PopupMenuTarget} target
 * @param {PopupMenuProvider[]} providers
 *
 * @return {PopupMenuHeaderEntries}
 */
PopupMenu.prototype._getHeaderEntries = function(target, providers) {
  var entries = {};

  forEach(providers, function(provider) {

    // handle legacy method
    if (!provider.getPopupMenuHeaderEntries) {
      if (!provider.getHeaderEntries) {
        return;
      }

      forEach(provider.getHeaderEntries(target), function(entry) {
        var id = entry.id;

        if (!id) {
          throw new Error('entry ID is missing');
        }

        entries[id] = omit(entry, [ 'id' ]);
      });

      return;
    }

    var entriesOrUpdater = provider.getPopupMenuHeaderEntries(target);

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


PopupMenu.prototype._getEmptyPlaceholder = function(providers) {

  const provider = providers.find(
    provider => isFunction(provider.getEmptyPlaceholder)
  );

  return provider && provider.getEmptyPlaceholder();
};


/**
 * Check if the popup menu is open.
 *
 * @return {boolean}
 */
PopupMenu.prototype.isOpen = function() {
  return !!this._current;
};


/**
 * Trigger an action associated with an entry.
 *
 * @param {Event} event
 * @param {PopupMenuEntry} entry
 * @param {string} [action='click']
 *
 * @return {any}
 */
PopupMenu.prototype.trigger = function(event, entry, action = 'click') {

  // silence other actions
  event.preventDefault();

  if (!entry) {
    let element = domClosest(event.delegateTarget || event.target, '.entry', true);
    let entryId = domAttr(element, DATA_REF);

    entry = { id: entryId, ...this._getEntry(entryId) };
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
 * Get the entry (entry or header entry) with the given ID.
 *
 * @param {string} entryId
 *
 * @return {PopupMenuEntry|PopupMenuHeaderEntry}
 */
PopupMenu.prototype._getEntry = function(entryId) {

  var entry = this._current.entries[ entryId ] || this._current.headerEntries[ entryId ];


  if (!entry) {
    throw new Error('entry not found');
  }

  return entry;
};