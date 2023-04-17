import {
  isArray,
  isString,
  isObject,
  assign,
  forEach,
  find,
  filter,
  matchPattern,
  isDefined
} from 'min-dash';

import {
  assignStyle,
  domify,
  classes as domClasses,
  attr as domAttr,
  remove as domRemove,
  clear as domClear
} from 'min-dom';

import {
  getBBox
} from '../../util/Elements';

import Ids from '../../util/IdGenerator';

// document wide unique overlay ids
var ids = new Ids('ov');

var LOW_PRIORITY = 500;

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 *
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef { {
 *   minZoom?: number,
 *   maxZoom?: number
 * } } OverlaysConfigShow
 *
 * @typedef { {
 *   min?: number,
 *   max?: number
 * } } OverlaysConfigScale
 *
 * @typedef { {
*   id: string,
*   type: string | null,
*   element: Element | string
* } & OverlayAttrs } Overlay
*
 * @typedef { {
 *   html: HTMLElement | string,
 *   position: {
 *     top?: number,
 *     right?: number,
 *     bottom?: number,
 *     left?: number
 *   }
 * } & OverlaysConfigDefault } OverlayAttrs
 *
 * @typedef { {
 *   html: HTMLElement,
 *   element: Element,
 *   overlays: Overlay[]
 * } } OverlayContainer
 *
 * @typedef {{
 *   defaults?: OverlaysConfigDefault
 * }} OverlaysConfig
 *
 * @typedef { {
 *  show?: OverlaysConfigShow,
 *  scale?: OverlaysConfigScale | boolean
 * } } OverlaysConfigDefault
 *
 * @typedef { {
 *   id?: string;
 *   element?: Element | string;
 *   type?: string;
 * } | string } OverlaysFilter
 */

/**
 * A service that allows users to attach overlays to diagram elements.
 *
 * The overlay service will take care of overlay positioning during updates.
 *
 * @example
 *
 * ```javascript
 * // add a pink badge on the top left of the shape
 *
 * overlays.add(someShape, {
 *   position: {
 *     top: -5,
 *     left: -5
 *   },
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or add via shape id
 *
 * overlays.add('some-element-id', {
 *   position: {
 *     top: -5,
 *     left: -5
 *   }
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or add with optional type
 *
 * overlays.add(someShape, 'badge', {
 *   position: {
 *     top: -5,
 *     left: -5
 *   }
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 * ```
 *
 * ```javascript
 * // remove an overlay
 *
 * var id = overlays.add(...);
 * overlays.remove(id);
 *
 *
 * You may configure overlay defaults during tool by providing a `config` module
 * with `overlays.defaults` as an entry:
 *
 * {
 *   overlays: {
 *     defaults: {
 *       show: {
 *         minZoom: 0.7,
 *         maxZoom: 5.0
 *       },
 *       scale: {
 *         min: 1
 *       }
 *     }
 * }
 * ```
 *
 * @param {OverlaysConfig} config
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementRegistry} elementRegistry
 */
export default function Overlays(config, eventBus, canvas, elementRegistry) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._elementRegistry = elementRegistry;

  this._ids = ids;

  /**
   * @type {OverlaysConfigDefault}
   */
  this._overlayDefaults = assign({

    // no show constraints
    show: null,

    // always scale
    scale: true
  }, config && config.defaults);

  /**
   * @type {Map<string, Overlay>}
   */
  this._overlays = {};

  /**
   * @type {OverlayContainer[]}
   */
  this._overlayContainers = [];

  /**
   * @type {HTMLElement}
   */
  this._overlayRoot = createRoot(canvas.getContainer());

  this._init();
}


Overlays.$inject = [
  'config.overlays',
  'eventBus',
  'canvas',
  'elementRegistry'
];


/**
 * Returns the overlay with the specified ID or a list of overlays
 * for an element with a given type.
 *
 * @example
 *
 * ```javascript
 * // return the single overlay with the given ID
 * overlays.get('some-id');
 *
 * // return all overlays for the shape
 * overlays.get({ element: someShape });
 *
 * // return all overlays on shape with type 'badge'
 * overlays.get({ element: someShape, type: 'badge' });
 *
 * // shape can also be specified as ID
 * overlays.get({ element: 'element-id', type: 'badge' });
 * ```
 *
 * @param {OverlaysFilter} search The filter to be used to find the overlay(s).
 *
 * @return {Overlay|Overlay[]} The overlay(s).
 */
Overlays.prototype.get = function(search) {

  if (isString(search)) {
    search = { id: search };
  }

  if (isString(search.element)) {
    search.element = this._elementRegistry.get(search.element);
  }

  if (search.element) {
    var container = this._getOverlayContainer(search.element, true);

    // return a list of overlays when searching by element (+type)
    if (container) {
      return search.type ? filter(container.overlays, matchPattern({ type: search.type })) : container.overlays.slice();
    } else {
      return [];
    }
  } else
  if (search.type) {
    return filter(this._overlays, matchPattern({ type: search.type }));
  } else {

    // return single element when searching by id
    return search.id ? this._overlays[search.id] : null;
  }
};

/**
 * Adds an HTML overlay to an element.
 *
 * @param {Element|string} element The element to add the overlay to.
 * @param {string} [type] An optional type that can be used to filter.
 * @param {OverlayAttrs} overlay The overlay.
 *
 * @return {string} The overlay's ID that can be used to get or remove it.
 */
Overlays.prototype.add = function(element, type, overlay) {

  if (isObject(type)) {
    overlay = type;
    type = null;
  }

  if (!element.id) {
    element = this._elementRegistry.get(element);
  }

  if (!overlay.position) {
    throw new Error('must specifiy overlay position');
  }

  if (!overlay.html) {
    throw new Error('must specifiy overlay html');
  }

  if (!element) {
    throw new Error('invalid element specified');
  }

  var id = this._ids.next();

  overlay = assign({}, this._overlayDefaults, overlay, {
    id: id,
    type: type,
    element: element,
    html: overlay.html
  });

  this._addOverlay(overlay);

  return id;
};


/**
 * Remove an overlay with the given ID or all overlays matching the given filter.
 *
 * @see Overlays#get for filter options.
 *
 * @param {OverlaysFilter} filter The filter to be used to find the overlay.
 */
Overlays.prototype.remove = function(filter) {

  var overlays = this.get(filter) || [];

  if (!isArray(overlays)) {
    overlays = [ overlays ];
  }

  var self = this;

  forEach(overlays, function(overlay) {

    var container = self._getOverlayContainer(overlay.element, true);

    if (overlay) {
      domRemove(overlay.html);
      domRemove(overlay.htmlContainer);

      delete overlay.htmlContainer;
      delete overlay.element;

      delete self._overlays[overlay.id];
    }

    if (container) {
      var idx = container.overlays.indexOf(overlay);
      if (idx !== -1) {
        container.overlays.splice(idx, 1);
      }
    }
  });

};

/**
 * Checks whether overlays are shown.
 *
 * @return {boolean} Whether overlays are shown.
 */
Overlays.prototype.isShown = function() {
  return this._overlayRoot.style.display !== 'none';
};

/**
 * Show all overlays.
 */
Overlays.prototype.show = function() {
  setVisible(this._overlayRoot);
};

/**
 * Hide all overlays.
 */
Overlays.prototype.hide = function() {
  setVisible(this._overlayRoot, false);
};

/**
 * Remove all overlays and their container.
 */
Overlays.prototype.clear = function() {
  this._overlays = {};

  this._overlayContainers = [];

  domClear(this._overlayRoot);
};

Overlays.prototype._updateOverlayContainer = function(container) {
  var element = container.element,
      html = container.html;

  // update container left,top according to the elements x,y coordinates
  // this ensures we can attach child elements relative to this container

  var x = element.x,
      y = element.y;

  if (element.waypoints) {
    var bbox = getBBox(element);
    x = bbox.x;
    y = bbox.y;
  }

  setPosition(html, x, y);

  domAttr(container.html, 'data-container-id', element.id);
};


Overlays.prototype._updateOverlay = function(overlay) {

  var position = overlay.position,
      htmlContainer = overlay.htmlContainer,
      element = overlay.element;

  // update overlay html relative to shape because
  // it is already positioned on the element

  // update relative
  var left = position.left,
      top = position.top;

  if (position.right !== undefined) {

    var width;

    if (element.waypoints) {
      width = getBBox(element).width;
    } else {
      width = element.width;
    }

    left = position.right * -1 + width;
  }

  if (position.bottom !== undefined) {

    var height;

    if (element.waypoints) {
      height = getBBox(element).height;
    } else {
      height = element.height;
    }

    top = position.bottom * -1 + height;
  }

  setPosition(htmlContainer, left || 0, top || 0);
  this._updateOverlayVisibilty(overlay, this._canvas.viewbox());
};


Overlays.prototype._createOverlayContainer = function(element) {
  var html = domify('<div class="djs-overlays" />');
  assignStyle(html, { position: 'absolute' });

  this._overlayRoot.appendChild(html);

  var container = {
    html: html,
    element: element,
    overlays: []
  };

  this._updateOverlayContainer(container);

  this._overlayContainers.push(container);

  return container;
};


Overlays.prototype._updateRoot = function(viewbox) {
  var scale = viewbox.scale || 1;

  var matrix = 'matrix(' +
  [
    scale,
    0,
    0,
    scale,
    -1 * viewbox.x * scale,
    -1 * viewbox.y * scale
  ].join(',') +
  ')';

  setTransform(this._overlayRoot, matrix);
};


Overlays.prototype._getOverlayContainer = function(element, raw) {
  var container = find(this._overlayContainers, function(c) {
    return c.element === element;
  });


  if (!container && !raw) {
    return this._createOverlayContainer(element);
  }

  return container;
};


Overlays.prototype._addOverlay = function(overlay) {

  var id = overlay.id,
      element = overlay.element,
      html = overlay.html,
      htmlContainer,
      overlayContainer;

  // unwrap jquery (for those who need it)
  if (html.get && html.constructor.prototype.jquery) {
    html = html.get(0);
  }

  // create proper html elements from
  // overlay HTML strings
  if (isString(html)) {
    html = domify(html);
  }

  overlayContainer = this._getOverlayContainer(element);

  htmlContainer = domify('<div class="djs-overlay" data-overlay-id="' + id + '">');
  assignStyle(htmlContainer, { position: 'absolute' });

  htmlContainer.appendChild(html);

  if (overlay.type) {
    domClasses(htmlContainer).add('djs-overlay-' + overlay.type);
  }

  var elementRoot = this._canvas.findRoot(element);
  var activeRoot = this._canvas.getRootElement();

  setVisible(htmlContainer, elementRoot === activeRoot);

  overlay.htmlContainer = htmlContainer;

  overlayContainer.overlays.push(overlay);
  overlayContainer.html.appendChild(htmlContainer);

  this._overlays[id] = overlay;

  this._updateOverlay(overlay);
  this._updateOverlayVisibilty(overlay, this._canvas.viewbox());
};


Overlays.prototype._updateOverlayVisibilty = function(overlay, viewbox) {
  var show = overlay.show,
      rootElement = this._canvas.findRoot(overlay.element),
      minZoom = show && show.minZoom,
      maxZoom = show && show.maxZoom,
      htmlContainer = overlay.htmlContainer,
      activeRootElement = this._canvas.getRootElement(),
      visible = true;

  if (rootElement !== activeRootElement) {
    visible = false;
  } else if (show) {
    if (
      (isDefined(minZoom) && minZoom > viewbox.scale) ||
      (isDefined(maxZoom) && maxZoom < viewbox.scale)
    ) {
      visible = false;
    }
  }

  setVisible(htmlContainer, visible);

  this._updateOverlayScale(overlay, viewbox);
};


Overlays.prototype._updateOverlayScale = function(overlay, viewbox) {
  var shouldScale = overlay.scale,
      minScale,
      maxScale,
      htmlContainer = overlay.htmlContainer;

  var scale, transform = '';

  if (shouldScale !== true) {

    if (shouldScale === false) {
      minScale = 1;
      maxScale = 1;
    } else {
      minScale = shouldScale.min;
      maxScale = shouldScale.max;
    }

    if (isDefined(minScale) && viewbox.scale < minScale) {
      scale = (1 / viewbox.scale || 1) * minScale;
    }

    if (isDefined(maxScale) && viewbox.scale > maxScale) {
      scale = (1 / viewbox.scale || 1) * maxScale;
    }
  }

  if (isDefined(scale)) {
    transform = 'scale(' + scale + ',' + scale + ')';
  }

  setTransform(htmlContainer, transform);
};


Overlays.prototype._updateOverlaysVisibilty = function(viewbox) {

  var self = this;

  forEach(this._overlays, function(overlay) {
    self._updateOverlayVisibilty(overlay, viewbox);
  });
};


Overlays.prototype._init = function() {

  var eventBus = this._eventBus;

  var self = this;


  // scroll/zoom integration

  function updateViewbox(viewbox) {
    self._updateRoot(viewbox);
    self._updateOverlaysVisibilty(viewbox);

    self.show();
  }

  eventBus.on('canvas.viewbox.changing', function(event) {
    self.hide();
  });

  eventBus.on('canvas.viewbox.changed', function(event) {
    updateViewbox(event.viewbox);
  });


  // remove integration

  eventBus.on([ 'shape.remove', 'connection.remove' ], function(e) {
    var element = e.element;
    var overlays = self.get({ element: element });

    forEach(overlays, function(o) {
      self.remove(o.id);
    });

    var container = self._getOverlayContainer(element);

    if (container) {
      domRemove(container.html);
      var i = self._overlayContainers.indexOf(container);
      if (i !== -1) {
        self._overlayContainers.splice(i, 1);
      }
    }
  });


  // move integration

  eventBus.on('element.changed', LOW_PRIORITY, function(e) {
    var element = e.element;

    var container = self._getOverlayContainer(element, true);

    if (container) {
      forEach(container.overlays, function(overlay) {
        self._updateOverlay(overlay);
      });

      self._updateOverlayContainer(container);
    }
  });


  // marker integration, simply add them on the overlays as classes, too.

  eventBus.on('element.marker.update', function(e) {
    var container = self._getOverlayContainer(e.element, true);
    if (container) {
      domClasses(container.html)[e.add ? 'add' : 'remove'](e.marker);
    }
  });


  eventBus.on('root.set', function() {
    self._updateOverlaysVisibilty(self._canvas.viewbox());
  });

  // clear overlays with diagram

  eventBus.on('diagram.clear', this.clear, this);
};



// helpers /////////////////////////////

function createRoot(parentNode) {
  var root = domify(
    '<div class="djs-overlay-container" />'
  );

  assignStyle(root, {
    position: 'absolute',
    width: 0,
    height: 0
  });

  parentNode.insertBefore(root, parentNode.firstChild);

  return root;
}

function setPosition(el, x, y) {
  assignStyle(el, { left: x + 'px', top: y + 'px' });
}

/**
 * Set element visible
 *
 * @param {DOMElement} el
 * @param {boolean} [visible=true]
 */
function setVisible(el, visible) {
  el.style.display = visible === false ? 'none' : '';
}

function setTransform(el, transform) {

  el.style['transform-origin'] = 'top left';

  [ '', '-ms-', '-webkit-' ].forEach(function(prefix) {
    el.style[prefix + 'transform'] = transform;
  });
}