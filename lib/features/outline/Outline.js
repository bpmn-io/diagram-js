import { getBBox } from '../../util/Elements.js';

var LOW_PRIORITY = 500;

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import {
  query as domQuery
} from 'min-dom';

import {
  assign,
  forEach,
  isFunction
} from 'min-dash';

var DEFAULT_PRIORITY = 1000;

/**
 * @typedef {import('../../model/Types.js').Element} Element
 *
 * @typedef {import('./OutlineProvider.js').default} OutlineProvider
 * @typedef {import('../../core/EventBus.js').default} EventBus
 * @typedef {import('../../core/ElementRegistry.js').default} ElementRegistry
 * @typedef {import('../../draw/Styles.js').default} Styles
 */

/**
 * @class
 *
 * A plugin that adds an outline to shapes and connections that may be activated and styled
 * via CSS classes.
 *
 * The outline is created lazily, i.e. only once an element is hovered or selected
 * for the first time. This keeps importing large diagrams fast, as we avoid
 * creating (and laying out) an outline for every single element up front.
 *
 * @param {EventBus} eventBus
 * @param {Styles} styles
 * @param {ElementRegistry} elementRegistry
 */
export default function Outline(eventBus, styles, elementRegistry) {

  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;

  this.offset = 5;

  this._outlineStyle = styles.cls('djs-outline', [ 'no-fill' ]);

  var self = this;

  /**
   * Lazily create the outline once an element is hovered or selected.
   *
   * @param {Element} element
   */
  function createElementOutline(element) {
    self.createOutline(element);
  }

  eventBus.on('element.hover', function(event) {
    createElementOutline(event.element);
  });

  eventBus.on('selection.changed', function(event) {
    forEach(event.newSelection, createElementOutline);
  });

  // Keep an already created outline in sync with its element. Elements that
  // have not been hovered or selected yet do not have an outline; those are
  // created (and updated) lazily via the handlers above.
  //
  // A low priority is necessary, because outlines of labels have to be updated
  // after the label bounds have been updated in the renderer.
  eventBus.on([ 'shape.changed', 'connection.changed' ], LOW_PRIORITY, function(event) {
    var element = event.element,
        gfx = event.gfx;

    var outline = domQuery('.djs-outline', gfx);

    if (outline) {
      self.updateOutline(element, outline);
    }
  });
}

/**
 * Ensure the outline for the given element is present, creating, appending
 * and updating it on first access.
 *
 * Outlines are created lazily, i.e. only once an element is hovered or
 * selected. Use this to force outline creation, e.g. for features or tests
 * that rely on the outline being present.
 *
 * @param {Element} element
 *
 * @return {SVGElement|null} the element's outline, or `null` if the element
 * has no rendered graphics
 */
Outline.prototype.createOutline = function(element) {
  var gfx = this._elementRegistry.getGraphics(element);

  if (!gfx) {
    return null;
  }

  var outline = domQuery('.djs-outline', gfx);

  if (!outline) {
    outline = this.getOutline(element) || this._createOutlineGfx();
    svgAppend(gfx, outline);

    this.updateOutline(element, outline);
  }

  return outline;
};

/**
 * Create the default outline graphics.
 *
 * @return {SVGElement} outline
 */
Outline.prototype._createOutlineGfx = function() {
  var outline = svgCreate('rect');

  svgAttr(outline, assign({
    x: 0,
    y: 0,
    rx: 4,
    width: 100,
    height: 100
  }, this._outlineStyle));

  return outline;
};

/**
 * Updates the outline of the given element, dispatching to the shape or
 * connection specific update depending on the element type.
 *
 * @param {Element} element
 * @param {SVGElement} outline
 */
Outline.prototype.updateOutline = function(element, outline) {
  if (element.waypoints) {
    this.updateConnectionOutline(outline, element);
  } else {
    this.updateShapeOutline(outline, element);
  }
};


/**
 * Updates the outline of a shape respecting the dimension of the
 * element and an outline offset.
 *
 * @param {SVGElement} outline
 * @param {Element} element
 */
Outline.prototype.updateShapeOutline = function(outline, element) {

  var updated = false;
  var providers = this._getProviders();

  if (providers.length) {
    forEach(providers, function(provider) {
      updated = updated || provider.updateOutline(element, outline);
    });
  }

  if (!updated) {
    svgAttr(outline, {
      x: -this.offset,
      y: -this.offset,
      width: element.width + this.offset * 2,
      height: element.height + this.offset * 2
    });
  }
};

/**
 * Updates the outline of a connection respecting the bounding box of
 * the connection and an outline offset.
 * Register an outline provider with the given priority.
 *
 * @param {SVGElement} outline
 * @param {Element} connection
 */
Outline.prototype.updateConnectionOutline = function(outline, connection) {
  var bbox = getBBox(connection);

  svgAttr(outline, {
    x: bbox.x - this.offset,
    y: bbox.y - this.offset,
    width: bbox.width + this.offset * 2,
    height: bbox.height + this.offset * 2
  });
};

/**
 * Register an outline provider with the given priority.
 *
 * @param {number} priority
 * @param {OutlineProvider} provider
 */
Outline.prototype.registerProvider = function(priority, provider) {
  if (!provider) {
    provider = priority;
    priority = DEFAULT_PRIORITY;
  }

  this._eventBus.on('outline.getProviders', priority, function(event) {
    event.providers.push(provider);
  });
};

/**
 * Returns the registered outline providers.
 *
 * @returns {OutlineProvider[]}
 */
Outline.prototype._getProviders = function() {
  var event = this._eventBus.createEvent({
    type: 'outline.getProviders',
    providers: []
  });

  this._eventBus.fire(event);

  return event.providers;
};

/**
 * Returns the outline for an element.
 *
 * @param {Element} element
 */
Outline.prototype.getOutline = function(element) {
  var outline;
  var providers = this._getProviders();

  forEach(providers, function(provider) {

    if (!isFunction(provider.getOutline)) {
      return;
    }

    outline = outline || provider.getOutline(element);
  });

  return outline;
};

Outline.$inject = [ 'eventBus', 'styles', 'elementRegistry' ];