import {
  isArray,
  isFunction,
  forEach
} from 'min-dash';

import {
  domify,
  query as domQuery,
  attr as domAttr,
  clear as domClear,
  classes as domClasses,
  matches as domMatches,
  delegate as domDelegate,
  event as domEvent
} from 'min-dom';

import {
  escapeCSS
} from '../../util/EscapeUtil';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/EventBus').default} EventBus
 *
 * @typedef {import('./PaletteProvider').PaletteEntries} PaletteEntries
 * @typedef {import('./PaletteProvider').default} PaletteProvider
 */

var TOGGLE_SELECTOR = '.djs-palette-toggle',
    ENTRY_SELECTOR = '.entry',
    ELEMENT_SELECTOR = TOGGLE_SELECTOR + ', ' + ENTRY_SELECTOR;

var PALETTE_PREFIX = 'djs-palette-',
    PALETTE_SHOWN_CLS = 'shown',
    PALETTE_OPEN_CLS = 'open',
    PALETTE_TWO_COLUMN_CLS = 'two-column';

var DEFAULT_PRIORITY = 1000;


/**
 * A palette containing modeling elements.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function Palette(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;

  var self = this;

  eventBus.on('tool-manager.update', function(event) {
    var tool = event.tool;

    self.updateToolHighlight(tool);
  });

  eventBus.on('i18n.changed', function() {
    self._update();
  });

  eventBus.on('diagram.init', function() {

    self._diagramInitialized = true;

    self._rebuild();
  });
}

Palette.$inject = [ 'eventBus', 'canvas' ];

/**
 * @overlord
 *
 * Register a palette provider with default priority. See
 * {@link PaletteProvider} for examples.
 *
 * @param {PaletteProvider} provider
 */

/**
 * Register a palette provider with the given priority. See
 * {@link PaletteProvider} for examples.
 *
 * @param {number} priority
 * @param {PaletteProvider} provider
 */
Palette.prototype.registerProvider = function(priority, provider) {
  if (!provider) {
    provider = priority;
    priority = DEFAULT_PRIORITY;
  }

  this._eventBus.on('palette.getProviders', priority, function(event) {
    event.providers.push(provider);
  });

  this._rebuild();
};


/**
 * Returns the palette entries.
 *
 * @return {PaletteEntries}
 */
Palette.prototype.getEntries = function() {
  var providers = this._getProviders();

  return providers.reduce(addPaletteEntries, {});
};

Palette.prototype._rebuild = function() {

  if (!this._diagramInitialized) {
    return;
  }

  var providers = this._getProviders();

  if (!providers.length) {
    return;
  }

  if (!this._container) {
    this._init();
  }

  this._update();
};

/**
 * Initialize palette.
 */
Palette.prototype._init = function() {

  var self = this;

  var eventBus = this._eventBus;

  var parentContainer = this._getParentContainer();

  var container = this._container = domify(Palette.HTML_MARKUP);

  parentContainer.appendChild(container);
  domClasses(parentContainer).add(PALETTE_PREFIX + PALETTE_SHOWN_CLS);

  domDelegate.bind(container, ELEMENT_SELECTOR, 'click', function(event) {

    var target = event.delegateTarget;

    if (domMatches(target, TOGGLE_SELECTOR)) {
      return self.toggle();
    }

    self.trigger('click', event);
  });

  // prevent drag propagation
  domEvent.bind(container, 'mousedown', function(event) {
    event.stopPropagation();
  });

  // prevent drag propagation
  domDelegate.bind(container, ENTRY_SELECTOR, 'dragstart', function(event) {
    self.trigger('dragstart', event);
  });

  eventBus.on('canvas.resized', this._layoutChanged, this);

  eventBus.fire('palette.create', {
    container: container
  });
};

Palette.prototype._getProviders = function(id) {

  var event = this._eventBus.createEvent({
    type: 'palette.getProviders',
    providers: []
  });

  this._eventBus.fire(event);

  return event.providers;
};

/**
 * Update palette state.
 *
 * @param { {
 *   open?: boolean;
 *   twoColumn?: boolean;
 * } } [state]
 */
Palette.prototype._toggleState = function(state) {

  state = state || {};

  var parent = this._getParentContainer(),
      container = this._container;

  var eventBus = this._eventBus;

  var twoColumn;

  var cls = domClasses(container),
      parentCls = domClasses(parent);

  if ('twoColumn' in state) {
    twoColumn = state.twoColumn;
  } else {
    twoColumn = this._needsCollapse(parent.clientHeight, this._entries || {});
  }

  // always update two column
  cls.toggle(PALETTE_TWO_COLUMN_CLS, twoColumn);
  parentCls.toggle(PALETTE_PREFIX + PALETTE_TWO_COLUMN_CLS, twoColumn);

  if ('open' in state) {
    cls.toggle(PALETTE_OPEN_CLS, state.open);
    parentCls.toggle(PALETTE_PREFIX + PALETTE_OPEN_CLS, state.open);
  }

  eventBus.fire('palette.changed', {
    twoColumn: twoColumn,
    open: this.isOpen()
  });
};

Palette.prototype._update = function() {

  var entriesContainer = domQuery('.djs-palette-entries', this._container),
      entries = this._entries = this.getEntries();

  domClear(entriesContainer);

  forEach(entries, function(entry, id) {

    var grouping = entry.group || 'default';

    var container = domQuery('[data-group=' + escapeCSS(grouping) + ']', entriesContainer);
    if (!container) {
      container = domify('<div class="group"></div>');
      domAttr(container, 'data-group', grouping);

      entriesContainer.appendChild(container);
    }

    var html = entry.html || (
      entry.separator ?
        '<hr class="separator" />' :
        '<div class="entry" draggable="true"></div>');


    var control = domify(html);
    container.appendChild(control);

    if (!entry.separator) {
      domAttr(control, 'data-action', id);

      if (entry.title) {
        domAttr(control, 'title', entry.title);
      }

      if (entry.className) {
        addClasses(control, entry.className);
      }

      if (entry.imageUrl) {
        var image = domify('<img>');
        domAttr(image, 'src', entry.imageUrl);

        control.appendChild(image);
      }
    }
  });

  // open after update
  this.open();
};


/**
 * Trigger an action available on the palette
 *
 * @param {string} action
 * @param {Event} event
 * @param {boolean} [autoActivate=false]
 */
Palette.prototype.trigger = function(action, event, autoActivate) {
  var entry,
      originalEvent,
      button = event.delegateTarget || event.target;

  if (!button) {
    return event.preventDefault();
  }

  entry = domAttr(button, 'data-action');
  originalEvent = event.originalEvent || event;

  return this.triggerEntry(entry, action, originalEvent, autoActivate);
};

/**
 * @param {string} entryId
 * @param {string} action
 * @param {Event} event
 * @param {boolean} [autoActivate=false]
 */
Palette.prototype.triggerEntry = function(entryId, action, event, autoActivate) {
  var entries = this._entries,
      entry,
      handler;

  entry = entries[entryId];

  // when user clicks on the palette and not on an action
  if (!entry) {
    return;
  }

  handler = entry.action;

  if (this._eventBus.fire('palette.trigger', { entry, event }) === false) {
    return;
  }

  // simple action (via callback function)
  if (isFunction(handler)) {
    if (action === 'click') {
      return handler(event, autoActivate);
    }
  } else {
    if (handler[action]) {
      return handler[action](event, autoActivate);
    }
  }

  // silence other actions
  event.preventDefault();
};

Palette.prototype._layoutChanged = function() {
  this._toggleState({});
};

/**
 * Do we need to collapse to two columns?
 *
 * @param {number} availableHeight
 * @param {PaletteEntries} entries
 *
 * @return {boolean}
 */
Palette.prototype._needsCollapse = function(availableHeight, entries) {

  // top margin + bottom toggle + bottom margin
  // implementors must override this method if they
  // change the palette styles
  var margin = 20 + 10 + 20;

  var entriesHeight = Object.keys(entries).length * 46;

  return availableHeight < entriesHeight + margin;
};

/**
 * Close the palette.
 */
Palette.prototype.close = function() {
  this._toggleState({
    open: false,
    twoColumn: false
  });
};

/**
 * Open the palette.
 */
Palette.prototype.open = function() {
  this._toggleState({ open: true });
};

/**
 * Toggle the palette.
 */
Palette.prototype.toggle = function() {
  if (this.isOpen()) {
    this.close();
  } else {
    this.open();
  }
};

/**
 * @param {string} tool
 *
 * @return {boolean}
 */
Palette.prototype.isActiveTool = function(tool) {
  return tool && this._activeTool === tool;
};

/**
 * @param {string} name
 */
Palette.prototype.updateToolHighlight = function(name) {
  var entriesContainer,
      toolsContainer;

  if (!this._toolsContainer) {
    entriesContainer = domQuery('.djs-palette-entries', this._container);

    this._toolsContainer = domQuery('[data-group=tools]', entriesContainer);
  }

  toolsContainer = this._toolsContainer;

  forEach(toolsContainer.children, function(tool) {
    var actionName = tool.getAttribute('data-action');

    if (!actionName) {
      return;
    }

    var toolClasses = domClasses(tool);

    actionName = actionName.replace('-tool', '');

    if (toolClasses.contains('entry') && actionName === name) {
      toolClasses.add('highlighted-entry');
    } else {
      toolClasses.remove('highlighted-entry');
    }
  });
};


/**
 * Return `true` if the palette is opened.
 *
 * @example
 *
 * ```javascript
 * palette.open();
 *
 * if (palette.isOpen()) {
 *   // yes, we are open
 * }
 * ```
 *
 * @return {boolean}
 */
Palette.prototype.isOpen = function() {
  return domClasses(this._container).has(PALETTE_OPEN_CLS);
};

/**
 * Get parent element of palette.
 *
 * @return {HTMLElement}
 */
Palette.prototype._getParentContainer = function() {
  return this._canvas.getContainer();
};


/* markup definition */

Palette.HTML_MARKUP =
  '<div class="djs-palette">' +
    '<div class="djs-palette-entries"></div>' +
    '<div class="djs-palette-toggle"></div>' +
  '</div>';


// helpers //////////////////////

function addClasses(element, classNames) {

  var classes = domClasses(element);

  var actualClassNames = isArray(classNames) ? classNames : classNames.split(/\s+/g);
  actualClassNames.forEach(function(cls) {
    classes.add(cls);
  });
}

function addPaletteEntries(entries, provider) {

  var entriesOrUpdater = provider.getPaletteEntries();

  if (isFunction(entriesOrUpdater)) {
    return entriesOrUpdater(entries);
  }

  forEach(entriesOrUpdater, function(entry, id) {
    entries[id] = entry;
  });

  return entries;
}