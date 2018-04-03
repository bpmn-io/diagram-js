import {
  isFunction,
  isArray,
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


var TOGGLE_SELECTOR = '.djs-palette-toggle',
    ENTRY_SELECTOR = '.entry',
    ELEMENT_SELECTOR = TOGGLE_SELECTOR + ', ' + ENTRY_SELECTOR;

var PALETTE_OPEN_CLS = 'open',
    PALETTE_TWO_COLUMN_CLS = 'two-column';


/**
 * A palette containing modeling elements.
 */
export default function Palette(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;

  this._providers = [];

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

    // initialize + update once diagram is ready
    if (self._providers.length) {
      self._init();

      self._update();
    }
  });
}

Palette.$inject = [ 'eventBus', 'canvas' ];


/**
 * Register a provider with the palette
 *
 * @param  {PaletteProvider} provider
 */
Palette.prototype.registerProvider = function(provider) {
  this._providers.push(provider);

  // postpone init / update until diagram is initialized
  if (!this._diagramInitialized) {
    return;
  }

  if (!this._container) {
    this._init();
  }

  this._update();
};


/**
 * Returns the palette entries for a given element
 *
 * @return {Array<PaletteEntryDescriptor>} list of entries
 */
Palette.prototype.getEntries = function() {

  var entries = {};

  // loop through all providers and their entries.
  // group entries by id so that overriding an entry is possible
  forEach(this._providers, function(provider) {
    var e = provider.getPaletteEntries();

    forEach(e, function(entry, id) {
      entries[id] = entry;
    });
  });

  return entries;
};


/**
 * Initialize
 */
Palette.prototype._init = function() {
  var canvas = this._canvas,
      eventBus = this._eventBus;

  var parent = canvas.getContainer(),
      container = this._container = domify(Palette.HTML_MARKUP),
      self = this;

  parent.appendChild(container);

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

/**
 * Update palette state.
 *
 * @param  {Object} [state] { open, twoColumn }
 */
Palette.prototype._toggleState = function(state) {

  state = state || {};

  var parent = this._getParentContainer(),
      container = this._container;

  var eventBus = this._eventBus;

  var twoColumn;

  var cls = domClasses(container);

  if ('twoColumn' in state) {
    twoColumn = state.twoColumn;
  } else {
    twoColumn = this._needsCollapse(parent.clientHeight, this._entries || {});
  }

  // always update two column
  cls.toggle(PALETTE_TWO_COLUMN_CLS, twoColumn);

  if ('open' in state) {
    cls.toggle(PALETTE_OPEN_CLS, state.open);
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

    var container = domQuery('[data-group=' + grouping + ']', entriesContainer);
    if (!container) {
      container = domify('<div class="group" data-group="' + grouping + '"></div>');
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
        control.appendChild(domify('<img src="' + entry.imageUrl + '">'));
      }
    }
  });

  // open after update
  this.open();
};


/**
 * Trigger an action available on the palette
 *
 * @param  {String} action
 * @param  {Event} event
 */
Palette.prototype.trigger = function(action, event, autoActivate) {
  var entries = this._entries,
      entry,
      handler,
      originalEvent,
      button = event.delegateTarget || event.target;

  if (!button) {
    return event.preventDefault();
  }

  entry = entries[domAttr(button, 'data-action')];

  // when user clicks on the palette and not on an action
  if (!entry) {
    return;
  }

  handler = entry.action;

  originalEvent = event.originalEvent || event;

  // simple action (via callback function)
  if (isFunction(handler)) {
    if (action === 'click') {
      handler(originalEvent, autoActivate);
    }
  } else {
    if (handler[action]) {
      handler[action](originalEvent, autoActivate);
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
 * @param {Number} availableHeight
 * @param {Object} entries
 *
 * @return {Boolean}
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
 * Close the palette
 */
Palette.prototype.close = function() {

  this._toggleState({
    open: false,
    twoColumn: false
  });
};


/**
 * Open the palette
 */
Palette.prototype.open = function() {
  this._toggleState({ open: true });
};


Palette.prototype.toggle = function(open) {
  if (this.isOpen()) {
    this.close();
  } else {
    this.open();
  }
};

Palette.prototype.isActiveTool = function(tool) {
  return tool && this._activeTool === tool;
};

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
 * Return true if the palette is opened.
 *
 * @example
 *
 * palette.open();
 *
 * if (palette.isOpen()) {
 *   // yes, we are open
 * }
 *
 * @return {boolean} true if palette is opened
 */
Palette.prototype.isOpen = function() {
  return domClasses(this._container).has(PALETTE_OPEN_CLS);
};

/**
 * Get container the palette lives in.
 *
 * @return {Element}
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
