import {
  every,
  forEach,
  isArray,
  isFunction
} from 'min-dash';

import {
  delegate as domDelegate,
  event as domEvent,
  attr as domAttr,
  query as domQuery,
  classes as domClasses,
  domify as domify
} from 'min-dom';

import {
  escapeCSS
} from '../../util/EscapeUtil';

import { isConnection } from '../../util/ModelUtil';

var MARKER_HIDDEN = 'djs-element-hidden';

/**
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef {import('../../util/Types').Rect} Rect
 * @typedef {import('../../util/Types').RectTRBL} RectTRBL
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../../scheduler/Scheduler').default} Scheduler
 *
 * @typedef {import('./ContextPadProvider').default} ContextPadProvider
 * @typedef {import('./ContextPadProvider').ContextPadEntries} ContextPadEntries
 *
 */

/**
 * @template {Element} [ElementType=Element]
 *
 * @typedef {ElementType|ElementType[]} ContextPadTarget
 */

var entrySelector = '.entry';

var DEFAULT_PRIORITY = 1000;
var CONTEXT_PAD_MARGIN = 8;
var HOVER_DELAY = 300;

/**
 * A context pad that displays element specific, contextual actions next
 * to a diagram element.
 *
 * @param {Canvas} canvas
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 * @param {Scheduler} scheduler
 */
export default function ContextPad(canvas, elementRegistry, eventBus, scheduler) {

  this._canvas = canvas;
  this._elementRegistry = elementRegistry;
  this._eventBus = eventBus;
  this._scheduler = scheduler;

  this._current = null;

  this._init();
}

ContextPad.$inject = [
  'canvas',
  'elementRegistry',
  'eventBus',
  'scheduler'
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

    var target = current.target;

    var targets = isArray(target) ? target : [ target ];

    var targetsChanged = targets.filter(function(element) {
      return elements.includes(element);
    });

    if (targetsChanged.length) {

      // (1) close
      self.close();

      var targetsNew = targets.filter(function(element) {
        return self._elementRegistry.get(element.id);
      });

      if (targetsNew.length) {

        // (2) re-open with new targets being all previous targets that still
        // exist
        self._updateAndOpen(targetsNew.length > 1 ? targetsNew : targetsNew[ 0 ]);
      }
    }
  });

  this._eventBus.on('canvas.viewbox.changed', function() {
    self._updatePosition();
  });

  this._eventBus.on('element.marker.update', function(event) {
    if (!self.isOpen()) {
      return;
    }

    var element = event.element;

    var current = self._current;

    var targets = isArray(current.target) ? current.target : [ current.target ];

    if (!targets.includes(element)) {
      return;
    }

    self._updateVisibility();
  });

  this._container = this._createContainer();
};

ContextPad.prototype._createContainer = function() {
  var container = domify('<div class="djs-context-pad-parent"></div>');

  this._canvas.getContainer().appendChild(container);

  return container;
};

/**
 * @overlord
 *
 * Register a context pad provider with the default priority. See
 * {@link ContextPadProvider} for examples.
 *
 * @param {ContextPadProvider} provider
 */

/**
 * Register a context pad provider with the given priority. See
 * {@link ContextPadProvider} for examples.
 *
 * @param {number} priority
 * @param {ContextPadProvider} provider
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
 * @return {ContextPadEntries} list of entries
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
 * Trigger context pad via DOM event.
 *
 * The entry to trigger is determined by the target element.
 *
 * @param {string} action
 * @param {Event} event
 * @param {boolean} [autoActivate=false]
 */
ContextPad.prototype.trigger = function(action, event, autoActivate) {
  var self = this;

  var entry,
      originalEvent,
      button = event.delegateTarget || event.target;

  if (!button) {
    return event.preventDefault();
  }

  entry = domAttr(button, 'data-action');
  originalEvent = event.originalEvent || event;

  if (action === 'mouseover') {
    this._timeout = setTimeout(function() {
      self._mouseout = self.triggerEntry(entry, 'hover', originalEvent, autoActivate);
    }, HOVER_DELAY);

    return;
  } else if (action === 'mouseout') {
    clearTimeout(this._timeout);

    if (this._mouseout) {
      this._mouseout();

      this._mouseout = null;
    }

    return;
  }

  return this.triggerEntry(entry, action, originalEvent, autoActivate);
};

/**
 * Trigger action on context pad entry entry, e.g. click, mouseover or mouseout.
 *
 * @param {string} entryId
 * @param {string} action
 * @param {Event} event
 * @param {boolean} [autoActivate=false]
 */
ContextPad.prototype.triggerEntry = function(entryId, action, event, autoActivate) {

  if (!this.isShown()) {
    return;
  }

  var target = this._current.target,
      entries = this._current.entries;

  var entry = entries[entryId];

  if (!entry) {
    return;
  }

  var handler = entry.action;

  if (this._eventBus.fire('contextPad.trigger', { entry, event }) === false) {
    return;
  }

  // simple action (via callback function)
  if (isFunction(handler)) {
    if (action === 'click') {
      return handler(event, target, autoActivate);
    }
  } else {
    if (handler[action]) {
      return handler[action](event, target, autoActivate);
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
      html = this._createHtml(target),
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
    entries,
    html,
    target,
  };

  this._updatePosition();

  this._updateVisibility();

  this._eventBus.fire('contextPad.open', { current: this._current });
};

/**
 * @param {ContextPadTarget} target
 *
 * @return {HTMLElement}
 */
ContextPad.prototype._createHtml = function(target) {
  var self = this;

  var html = domify('<div class="djs-context-pad"></div>');

  domDelegate.bind(html, entrySelector, 'click', function(event) {
    self.trigger('click', event);
  });

  domDelegate.bind(html, entrySelector, 'dragstart', function(event) {
    self.trigger('dragstart', event);
  });

  domDelegate.bind(html, entrySelector, 'mouseover', function(event) {
    self.trigger('mouseover', event);
  });

  domDelegate.bind(html, entrySelector, 'mouseout', function(event) {
    self.trigger('mouseout', event);
  });

  // stop propagation of mouse events
  domEvent.bind(html, 'mousedown', function(event) {
    event.stopPropagation();
  });

  this._container.appendChild(html);

  this._eventBus.fire('contextPad.create', {
    target: target,
    pad: html
  });

  return html;
};

/**
 * @param {ContextPadTarget} target
 *
 * @return { { html: HTMLElement } }
 */
ContextPad.prototype.getPad = function(target) {
  console.warn(new Error('ContextPad#getPad is deprecated and will be removed in future library versions, cf. https://github.com/bpmn-io/diagram-js/pull/888'));

  let html;

  if (this.isOpen() && targetsEqual(this._current.target, target)) {
    html = this._current.html;
  } else {
    html = this._createHtml(target);
  }

  return { html };
};


/**
 * Close the context pad
 */
ContextPad.prototype.close = function() {
  if (!this.isOpen()) {
    return;
  }

  clearTimeout(this._timeout);

  this._container.innerHTML = '';

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
        return currentTarget.includes(element);
      })
    );
  } else {
    return currentTarget === target;
  }
};


/**
 * Check if pad is open and not hidden.
 *
 * @return {boolean}
 */
ContextPad.prototype.isShown = function() {
  return this.isOpen() && domClasses(this._current.html).has('open');
};

/**
 * Show context pad.
 */
ContextPad.prototype.show = function() {
  if (!this.isOpen()) {
    return;
  }

  domClasses(this._current.html).add('open');

  this._updatePosition();

  this._eventBus.fire('contextPad.show', { current: this._current });
};

/**
 * Hide context pad.
 */
ContextPad.prototype.hide = function() {
  if (!this.isOpen()) {
    return;
  }

  domClasses(this._current.html).remove('open');

  this._eventBus.fire('contextPad.hide', { current: this._current });
};

/**
 * Get context pad position.
 *
 * If target is connection context pad will be positioned at connection end.
 *
 * If multiple targets context pad will be placed at top right corner bounding
 * box.
 *
 * @param {ContextPadTarget} target
 *
 * @return {RectTRBL & { x: number, y: number }}
 */
ContextPad.prototype._getPosition = function(target) {
  if (!isArray(target) && isConnection(target)) {
    var viewbox = this._canvas.viewbox();

    var lastWaypoint = getLastWaypoint(target);

    var x = lastWaypoint.x * viewbox.scale - viewbox.x * viewbox.scale,
        y = lastWaypoint.y * viewbox.scale - viewbox.y * viewbox.scale;

    return {
      left: x + CONTEXT_PAD_MARGIN * this._canvas.zoom(),
      top: y
    };
  }

  var container = this._canvas.getContainer();

  var containerBounds = container.getBoundingClientRect();

  var targetBounds = this._getTargetBounds(target);

  return {
    left: targetBounds.right - containerBounds.left + CONTEXT_PAD_MARGIN * this._canvas.zoom(),
    top: targetBounds.top - containerBounds.top
  };
};

/**
 * Update context pad position.
 */
ContextPad.prototype._updatePosition = function() {
  if (!this.isOpen()) {
    return;
  }

  var html = this._current.html;

  var position = this._getPosition(this._current.target);

  if ('x' in position && 'y' in position) {
    html.style.left = position.x + 'px';
    html.style.top = position.y + 'px';
  } else {
    [
      'top',
      'right',
      'bottom',
      'left'
    ].forEach(function(key) {
      if (key in position) {
        html.style[ key ] = position[ key ] + 'px';
      }
    });
  }
};

/**
 * Update context pad visibility. Hide if any of the target elements is hidden
 * using the `djs-element-hidden` or `djs-label-hidden` markers.
 */
ContextPad.prototype._updateVisibility = function() {

  const updateFn = () => {
    if (!this.isOpen()) {
      return;
    }

    var self = this;

    var target = this._current.target;

    var targets = isArray(target) ? target : [ target ];

    var isHidden = targets.some(function(target) {
      return self._canvas.hasMarker(target, MARKER_HIDDEN);
    });

    if (isHidden) {
      self.hide();
    } else {
      self.show();
    }
  };

  this._scheduler.schedule(updateFn, 'ContextPad#_updateVisibility');
};

/**
 * Get bounding client rect of target element(s).
 *
 * @param {ContextPadTarget} target
 *
 * @returns {Rect & RectTRBL}
 */
ContextPad.prototype._getTargetBounds = function(target) {
  var self = this;

  var elements = isArray(target) ? target : [ target ];

  var elementsGfx = elements.map(function(element) {
    return self._canvas.getGraphics(element);
  });

  return elementsGfx.reduce(function(bounds, elementGfx) {
    const elementBounds = elementGfx.getBoundingClientRect();

    bounds.top = Math.min(bounds.top, elementBounds.top);
    bounds.right = Math.max(bounds.right, elementBounds.right);
    bounds.bottom = Math.max(bounds.bottom, elementBounds.bottom);
    bounds.left = Math.min(bounds.left, elementBounds.left);

    bounds.x = bounds.left;
    bounds.y = bounds.top;

    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;

    return bounds;
  }, {
    top: Infinity,
    right: -Infinity,
    bottom: -Infinity,
    left: Infinity
  });
};

// helpers //////////

function addClasses(element, classNames) {
  var classes = domClasses(element);

  classNames = isArray(classNames) ? classNames : classNames.split(/\s+/g);

  classNames.forEach(function(cls) {
    classes.add(cls);
  });
}

function getLastWaypoint(connection) {
  return connection.waypoints[connection.waypoints.length - 1];
}

/**
 * @param {ContextPadTarget} target
 * @param {ContextPadTarget} otherTarget
 *
 * @return {boolean}
 */
function targetsEqual(target, otherTarget) {
  target = isArray(target) ? target : [ target ];
  otherTarget = isArray(otherTarget) ? otherTarget : [ otherTarget ];

  return target.length === otherTarget.length
    && every(target, function(element) {
      return otherTarget.includes(element);
    });
}