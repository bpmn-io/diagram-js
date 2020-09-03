import {
  isNumber,
  assign,
  forEach,
  every,
  debounce,
  bind,
  reduce
} from 'min-dash';

import {
  add as collectionAdd,
  remove as collectionRemove
} from '../util/Collections';

import {
  getType
} from '../util/Elements';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  transform as svgTransform
} from 'tiny-svg';

import { createMatrix as createMatrix } from 'tiny-svg';


function round(number, resolution) {
  return Math.round(number * resolution) / resolution;
}

function ensurePx(number) {
  return isNumber(number) ? `${number}px` : number;
}

/**
 * Creates a HTML container element for a SVG element with
 * the given configuration
 *
 * @param  {Object} options
 * @return {HTMLElement} the container element
 */
function createContainer(options) {

  options = assign({}, { width: '100%', height: '100%' }, options);

  const container = options.container || document.body;

  // create a <div> around the svg element with the respective size
  // this way we can always get the correct container size
  // (this is impossible for <svg> elements at the moment)
  const parent = document.createElement('div');
  parent.setAttribute('class', 'djs-container');

  assign(parent.style, {
    position: 'relative',
    overflow: 'hidden',
    width: ensurePx(options.width),
    height: ensurePx(options.height)
  });

  container.appendChild(parent);

  return parent;
}

function createGroup(parent, cls, childIndex) {
  const group = svgCreate('g');
  svgClasses(group).add(cls);

  const index = childIndex !== undefined ? childIndex : parent.childNodes.length - 1;

  // must ensure second argument is node or _null_
  // cf. https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
  parent.insertBefore(group, parent.childNodes[index] || null);

  return group;
}

const BASE_LAYER = 'base';


const REQUIRED_MODEL_ATTRS = {
  shape: [ 'x', 'y', 'width', 'height' ],
  connection: [ 'waypoints' ]
};

/**
 * The main drawing canvas.
 *
 * @class
 * @constructor
 *
 * @emits Canvas#canvas.init
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementRegistry} elementRegistry
 */
export default class Canvas {
  constructor(config, eventBus, graphicsFactory, elementRegistry) {

    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
    this._graphicsFactory = graphicsFactory;

    this._init(config || {});
  }

  _init(config) {

    const eventBus = this._eventBus;

    // Creates a <svg> element that is wrapped into a <div>.
    // This way we are always able to correctly figure out the size of the svg element
    // by querying the parent node.
    //
    // (It is not possible to get the size of a svg element cross browser @ 2014-04-01)
    //
    // <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
    //   <svg width="100%" height="100%">
    //    ...
    //   </svg>
    // </div>

    // html container
    const container = this._container = createContainer(config);

    const svg = this._svg = svgCreate('svg');
    svgAttr(svg, { width: '100%', height: '100%' });

    svgAppend(container, svg);

    const viewport = this._viewport = createGroup(svg, 'viewport');

    this._layers = {};

    // debounce canvas.viewbox.changed events
    // for smoother diagram interaction
    if (config.deferUpdate !== false) {
      this._viewboxChanged = debounce(bind(this._viewboxChanged, this), 300);
    }

    eventBus.on('diagram.init', () => {

      /**
       * An event indicating that the canvas is ready to be drawn on.
       *
       * @memberOf Canvas
       *
       * @event canvas.init
       *
       * @type {Object}
       * @property {SVGElement} svg the created svg element
       * @property {SVGElement} viewport the direct parent of diagram elements and shapes
       */
      eventBus.fire('canvas.init', {
        svg,
        viewport
      });

    }, this);

    // reset viewbox on shape changes to
    // recompute the viewbox
    eventBus.on([
      'shape.added',
      'connection.added',
      'shape.removed',
      'connection.removed',
      'elements.changed'
    ], function() {
      delete this._cachedViewbox;
    }, this);

    eventBus.on('diagram.destroy', 500, this._destroy, this);
    eventBus.on('diagram.clear', 500, this._clear, this);
  }

  _destroy(emit) {
    this._eventBus.fire('canvas.destroy', {
      svg: this._svg,
      viewport: this._viewport
    });

    const parent = this._container.parentNode;

    if (parent) {
      parent.removeChild(this._container);
    }

    delete this._svg;
    delete this._container;
    delete this._layers;
    delete this._rootElement;
    delete this._viewport;
  }

  _clear() {

    const self = this;

    const allElements = this._elementRegistry.getAll();

    // remove all elements
    allElements.forEach(element => {
      const type = getType(element);

      if (type === 'root') {
        self.setRootElement(null, true);
      } else {
        self._removeElement(element, type);
      }
    });

    // force recomputation of view box
    delete this._cachedViewbox;
  }

  /**
   * Returns the default layer on which
   * all elements are drawn.
   *
   * @returns {SVGElement}
   */
  getDefaultLayer() {
    return this.getLayer(BASE_LAYER, 0);
  }

  /**
   * Returns a layer that is used to draw elements
   * or annotations on it.
   *
   * Non-existing layers retrieved through this method
   * will be created. During creation, the optional index
   * may be used to create layers below or above existing layers.
   * A layer with a certain index is always created above all
   * existing layers with the same index.
   *
   * @param {string} name
   * @param {number} index
   *
   * @returns {SVGElement}
   */
  getLayer(name, index) {

    if (!name) {
      throw new Error('must specify a name');
    }

    let layer = this._layers[name];

    if (!layer) {
      layer = this._layers[name] = this._createLayer(name, index);
    }

    // throw an error if layer creation / retrival is
    // requested on different index
    if (typeof index !== 'undefined' && layer.index !== index) {
      throw new Error(`layer <${name}> already created at index <${index}>`);
    }

    return layer.group;
  }

  /**
   * Creates a given layer and returns it.
   *
   * @param {string} name
   * @param {number} [index=0]
   *
   * @return {Object} layer descriptor with { index, group: SVGGroup }
   */
  _createLayer(name, index) {

    if (!index) {
      index = 0;
    }

    const childIndex = reduce(this._layers, (childIndex, layer) => {
      if (index >= layer.index) {
        childIndex++;
      }

      return childIndex;
    }, 0);

    return {
      group: createGroup(this._viewport, `layer-${name}`, childIndex),
      index
    };

  }

  /**
   * Returns the html element that encloses the
   * drawing canvas.
   *
   * @return {DOMNode}
   */
  getContainer() {
    return this._container;
  }

  // markers //////////////////////

  _updateMarker(element, marker, add) {
    let container;

    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    // we need to access all
    container = this._elementRegistry._elements[element.id];

    if (!container) {
      return;
    }

    forEach([ container.gfx, container.secondaryGfx ], gfx => {
      if (gfx) {

        // invoke either addClass or removeClass based on mode
        if (add) {
          svgClasses(gfx).add(marker);
        } else {
          svgClasses(gfx).remove(marker);
        }
      }
    });

    /**
     * An event indicating that a marker has been updated for an element
     *
     * @event element.marker.update
     * @type {Object}
     * @property {djs.model.Element} element the shape
     * @property {Object} gfx the graphical representation of the shape
     * @property {string} marker
     * @property {boolean} add true if the marker was added, false if it got removed
     */
    this._eventBus.fire('element.marker.update', { element, gfx: container.gfx, marker, add: !!add });
  }

  /**
   * Adds a marker to an element (basically a css class).
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @example
   * canvas.addMarker('foo', 'some-marker');
   *
   * var fooGfx = canvas.getGraphics('foo');
   *
   * fooGfx; // <g class="... some-marker"> ... </g>
   *
   * @param {string|djs.model.Base} element
   * @param {string} marker
   */
  addMarker(element, marker) {
    this._updateMarker(element, marker, true);
  }

  /**
   * Remove a marker from an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param  {string|djs.model.Base} element
   * @param  {string} marker
   */
  removeMarker(element, marker) {
    this._updateMarker(element, marker, false);
  }

  /**
   * Check the existence of a marker on element.
   *
   * @param  {string|djs.model.Base} element
   * @param  {string} marker
   */
  hasMarker(element, marker) {
    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    const gfx = this.getGraphics(element);

    return svgClasses(gfx).has(marker);
  }

  /**
   * Toggles a marker on an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param  {string|djs.model.Base} element
   * @param  {string} marker
   */
  toggleMarker(element, marker) {
    if (this.hasMarker(element, marker)) {
      this.removeMarker(element, marker);
    } else {
      this.addMarker(element, marker);
    }
  }

  getRootElement() {
    if (!this._rootElement) {
      this.setRootElement({ id: '__implicitroot', children: [] });
    }

    return this._rootElement;
  }

  // root element handling //////////////////////

  /**
   * Sets a given element as the new root element for the canvas
   * and returns the new root element.
   *
   * @param {Object|djs.model.Root} element
   * @param {boolean} [override] whether to override the current root element, if any
   *
   * @return {Object|djs.model.Root} new root element
   */
  setRootElement(element, override) {
    if (element) {
      this._ensureValid('root', element);
    }

    const currentRoot = this._rootElement;
    const elementRegistry = this._elementRegistry;
    const eventBus = this._eventBus;

    if (currentRoot) {
      if (!override) {
        throw new Error('rootElement already set, need to specify override');
      }

      // simulate element remove event sequence
      eventBus.fire('root.remove', { element: currentRoot });
      eventBus.fire('root.removed', { element: currentRoot });

      elementRegistry.remove(currentRoot);
    }

    if (element) {
      const gfx = this.getDefaultLayer();

      // resemble element add event sequence
      eventBus.fire('root.add', { element });

      elementRegistry.add(element, gfx, this._svg);

      eventBus.fire('root.added', { element, gfx });
    }

    this._rootElement = element;

    return element;
  }

  // add functionality //////////////////////

  _ensureValid(type, element) {
    if (!element.id) {
      throw new Error('element must have an id');
    }

    if (this._elementRegistry.get(element.id)) {
      throw new Error(`element with id ${element.id} already exists`);
    }

    const requiredAttrs = REQUIRED_MODEL_ATTRS[type];

    const valid = every(requiredAttrs, attr => {
      return typeof element[attr] !== 'undefined';
    });

    if (!valid) {
      throw new Error(
        `must supply { ${requiredAttrs.join(', ')} } with ${type}`);
    }
  }

  _setParent(element, parent, parentIndex) {
    collectionAdd(parent.children, element, parentIndex);
    element.parent = parent;
  }

  /**
   * Adds an element to the canvas.
   *
   * This wires the parent <-> child relationship between the element and
   * a explicitly specified parent or an implicit root element.
   *
   * During add it emits the events
   *
   *  * <{type}.add> (element, parent)
   *  * <{type}.added> (element, gfx)
   *
   * Extensions may hook into these events to perform their magic.
   *
   * @param {string} type
   * @param {Object|djs.model.Base} element
   * @param {Object|djs.model.Base} [parent]
   * @param {number} [parentIndex]
   *
   * @return {Object|djs.model.Base} the added element
   */
  _addElement(type, element, parent = this.getRootElement(), parentIndex) {
    const eventBus = this._eventBus;
    const graphicsFactory = this._graphicsFactory;

    this._ensureValid(type, element);

    eventBus.fire(`${type}.add`, { element, parent });

    this._setParent(element, parent, parentIndex);

    // create graphics
    const gfx = graphicsFactory.create(type, element, parentIndex);

    this._elementRegistry.add(element, gfx);

    // update its visual
    graphicsFactory.update(type, element, gfx);

    eventBus.fire(`${type}.added`, { element, gfx });

    return element;
  }

  /**
   * Adds a shape to the canvas
   *
   * @param {Object|djs.model.Shape} shape to add to the diagram
   * @param {djs.model.Base} [parent]
   * @param {number} [parentIndex]
   *
   * @return {djs.model.Shape} the added shape
   */
  addShape(shape, parent, parentIndex) {
    return this._addElement('shape', shape, parent, parentIndex);
  }

  /**
   * Adds a connection to the canvas
   *
   * @param {Object|djs.model.Connection} connection to add to the diagram
   * @param {djs.model.Base} [parent]
   * @param {number} [parentIndex]
   *
   * @return {djs.model.Connection} the added connection
   */
  addConnection(connection, parent, parentIndex) {
    return this._addElement('connection', connection, parent, parentIndex);
  }

  /**
   * Internal remove element
   */
  _removeElement(element, type) {
    const elementRegistry = this._elementRegistry;
    const graphicsFactory = this._graphicsFactory;
    const eventBus = this._eventBus;

    element = elementRegistry.get(element.id || element);

    if (!element) {

      // element was removed already
      return;
    }

    eventBus.fire(`${type}.remove`, { element });

    graphicsFactory.remove(element);

    // unset parent <-> child relationship
    collectionRemove(element.parent && element.parent.children, element);
    element.parent = null;

    eventBus.fire(`${type}.removed`, { element });

    elementRegistry.remove(element);

    return element;
  }

  /**
   * Removes a shape from the canvas
   *
   * @param {string|djs.model.Shape} shape or shape id to be removed
   *
   * @return {djs.model.Shape} the removed shape
   */
  removeShape(shape) {

    /**
     * An event indicating that a shape is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.remove
     * @type {Object}
     * @property {djs.model.Shape} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */

    /**
     * An event indicating that a shape has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.removed
     * @type {Object}
     * @property {djs.model.Shape} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */
    return this._removeElement(shape, 'shape');
  }

  /**
   * Removes a connection from the canvas
   *
   * @param {string|djs.model.Connection} connection or connection id to be removed
   *
   * @return {djs.model.Connection} the removed connection
   */
  removeConnection(connection) {

    /**
     * An event indicating that a connection is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event connection.remove
     * @type {Object}
     * @property {djs.model.Connection} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */

    /**
     * An event indicating that a connection has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event connection.removed
     * @type {Object}
     * @property {djs.model.Connection} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */
    return this._removeElement(connection, 'connection');
  }

  /**
   * Return the graphical object underlaying a certain diagram element
   *
   * @param {string|djs.model.Base} element descriptor of the element
   * @param {boolean} [secondary=false] whether to return the secondary connected element
   *
   * @return {SVGElement}
   */
  getGraphics(element, secondary) {
    return this._elementRegistry.getGraphics(element, secondary);
  }

  /**
   * Perform a viewbox update via a given change function.
   *
   * @param {Function} changeFn
   */
  _changeViewbox(changeFn) {

    // notify others of the upcoming viewbox change
    this._eventBus.fire('canvas.viewbox.changing');

    // perform actual change
    changeFn.apply(this);

    // reset the cached viewbox so that
    // a new get operation on viewbox or zoom
    // triggers a viewbox re-computation
    this._cachedViewbox = null;

    // notify others of the change; this step
    // may or may not be debounced
    this._viewboxChanged();
  }

  _viewboxChanged() {
    this._eventBus.fire('canvas.viewbox.changed', { viewbox: this.viewbox() });
  }

  /**
   * Gets or sets the view box of the canvas, i.e. the
   * area that is currently displayed.
   *
   * The getter may return a cached viewbox (if it is currently
   * changing). To force a recomputation, pass `false` as the first argument.
   *
   * @example
   *
   * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
   *
   * // sets the visible area of the diagram to (100|100) -> (600|100)
   * // and and scales it according to the diagram width
   *
   * var viewbox = canvas.viewbox(); // pass `false` to force recomputing the box.
   *
   * console.log(viewbox);
   * // {
   * //   inner: Dimensions,
   * //   outer: Dimensions,
   * //   scale,
   * //   x, y,
   * //   width, height
   * // }
   *
   * // if the current diagram is zoomed and scrolled, you may reset it to the
   * // default zoom via this method, too:
   *
   * var zoomedAndScrolledViewbox = canvas.viewbox();
   *
   * canvas.viewbox({
   *   x: 0,
   *   y: 0,
   *   width: zoomedAndScrolledViewbox.outer.width,
   *   height: zoomedAndScrolledViewbox.outer.height
   * });
   *
   * @param  {Object} [box] the new view box to set
   * @param  {number} box.x the top left X coordinate of the canvas visible in view box
   * @param  {number} box.y the top left Y coordinate of the canvas visible in view box
   * @param  {number} box.width the visible width
   * @param  {number} box.height
   *
   * @return {Object} the current view box
   */
  viewbox(box) {
    if (box === undefined && this._cachedViewbox) {
      return this._cachedViewbox;
    }

    const viewport = this._viewport;
    let innerBox;
    const outerBox = this.getSize();
    let matrix;
    let transform;
    let scale;
    let x;
    let y;

    if (!box) {

      // compute the inner box based on the
      // diagrams default layer. This allows us to exclude
      // external components, such as overlays
      innerBox = this.getDefaultLayer().getBBox();

      transform = svgTransform(viewport);
      matrix = transform ? transform.matrix : createMatrix();
      scale = round(matrix.a, 1000);

      x = round(-matrix.e || 0, 1000);
      y = round(-matrix.f || 0, 1000);

      box = this._cachedViewbox = {
        x: x ? x / scale : 0,
        y: y ? y / scale : 0,
        width: outerBox.width / scale,
        height: outerBox.height / scale,
        scale,
        inner: {
          width: innerBox.width,
          height: innerBox.height,
          x: innerBox.x,
          y: innerBox.y
        },
        outer: outerBox
      };

      return box;
    } else {

      this._changeViewbox(function() {
        scale = Math.min(outerBox.width / box.width, outerBox.height / box.height);

        const matrix = this._svg.createSVGMatrix()
          .scale(scale)
          .translate(-box.x, -box.y);

        svgTransform(viewport, matrix);
      });
    }

    return box;
  }

  /**
   * Gets or sets the scroll of the canvas.
   *
   * @param {Object} [delta] the new scroll to apply.
   *
   * @param {number} [delta.dx]
   * @param {number} [delta.dy]
   */
  scroll(delta) {

    const node = this._viewport;
    let matrix = node.getCTM();

    if (delta) {
      this._changeViewbox(function() {
        delta = assign({ dx: 0, dy: 0 }, delta || {});

        matrix = this._svg.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix);

        setCTM(node, matrix);
      });
    }

    return { x: matrix.e, y: matrix.f };
  }

  /**
   * Gets or sets the current zoom of the canvas, optionally zooming
   * to the specified position.
   *
   * The getter may return a cached zoom level. Call it with `false` as
   * the first argument to force recomputation of the current level.
   *
   * @param {string|number} [newScale] the new zoom level, either a number, i.e. 0.9,
   *                                   or `fit-viewport` to adjust the size to fit the current viewport
   * @param {string|Point} [center] the reference point { x: .., y: ..} to zoom to, 'auto' to zoom into mid or null
   *
   * @return {number} the current scale
   */
  zoom(newScale, center) {
    if (!newScale) {
      return this.viewbox(newScale).scale;
    }

    if (newScale === 'fit-viewport') {
      return this._fitViewport(center);
    }

    let outer;
    let matrix;

    this._changeViewbox(function() {

      if (typeof center !== 'object') {
        outer = this.viewbox().outer;

        center = {
          x: outer.width / 2,
          y: outer.height / 2
        };
      }

      matrix = this._setZoom(newScale, center);
    });

    return round(matrix.a, 1000);
  }

  _fitViewport(center) {
    const vbox = this.viewbox();
    const outer = vbox.outer;
    const inner = vbox.inner;
    let newScale;
    let newViewbox;

    // display the complete diagram without zooming in.
    // instead of relying on internal zoom, we perform a
    // hard reset on the canvas viewbox to realize this
    //
    // if diagram does not need to be zoomed in, we focus it around
    // the diagram origin instead

    if (inner.x >= 0 &&
        inner.y >= 0 &&
        inner.x + inner.width <= outer.width &&
        inner.y + inner.height <= outer.height &&
        !center) {

      newViewbox = {
        x: 0,
        y: 0,
        width: Math.max(inner.width + inner.x, outer.width),
        height: Math.max(inner.height + inner.y, outer.height)
      };
    } else {

      newScale = Math.min(1, outer.width / inner.width, outer.height / inner.height);
      newViewbox = {
        x: inner.x + (center ? inner.width / 2 - outer.width / newScale / 2 : 0),
        y: inner.y + (center ? inner.height / 2 - outer.height / newScale / 2 : 0),
        width: outer.width / newScale,
        height: outer.height / newScale
      };
    }

    this.viewbox(newViewbox);

    return this.viewbox(false).scale;
  }

  _setZoom(scale, center) {
    const svg = this._svg;
    const viewport = this._viewport;

    const matrix = svg.createSVGMatrix();
    const point = svg.createSVGPoint();

    let centerPoint;
    let originalPoint;
    let currentMatrix;
    let scaleMatrix;
    let newMatrix;

    currentMatrix = viewport.getCTM();

    const currentScale = currentMatrix.a;

    if (center) {
      centerPoint = assign(point, center);

      // revert applied viewport transformations
      originalPoint = centerPoint.matrixTransform(currentMatrix.inverse());

      // create scale matrix
      scaleMatrix = matrix
        .translate(originalPoint.x, originalPoint.y)
        .scale(1 / currentScale * scale)
        .translate(-originalPoint.x, -originalPoint.y);

      newMatrix = currentMatrix.multiply(scaleMatrix);
    } else {
      newMatrix = matrix.scale(scale);
    }

    setCTM(this._viewport, newMatrix);

    return newMatrix;
  }

  /**
   * Returns the size of the canvas
   *
   * @return {Dimensions}
   */
  getSize() {
    return {
      width: this._container.clientWidth,
      height: this._container.clientHeight
    };
  }

  /**
   * Return the absolute bounding box for the given element
   *
   * The absolute bounding box may be used to display overlays in the
   * callers (browser) coordinate system rather than the zoomed in/out
   * canvas coordinates.
   *
   * @param  {ElementDescriptor} element
   * @return {Bounds} the absolute bounding box
   */
  getAbsoluteBBox(element) {
    const vbox = this.viewbox();
    let bbox;

    // connection
    // use svg bbox
    if (element.waypoints) {
      const gfx = this.getGraphics(element);

      bbox = gfx.getBBox();
    }

    // shapes
    // use data
    else {
      bbox = element;
    }

    const x = bbox.x * vbox.scale - vbox.x * vbox.scale;
    const y = bbox.y * vbox.scale - vbox.y * vbox.scale;

    const width = bbox.width * vbox.scale;
    const height = bbox.height * vbox.scale;

    return {
      x,
      y,
      width,
      height
    };
  }

  /**
   * Fires an event in order other modules can react to the
   * canvas resizing
   */
  resized() {

    // force recomputation of view box
    delete this._cachedViewbox;

    this._eventBus.fire('canvas.resized');
  }
}

Canvas.$inject = [
  'config.canvas',
  'eventBus',
  'graphicsFactory',
  'elementRegistry'
];


function setCTM(node, m) {
  const mstr = `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`;
  node.setAttribute('transform', mstr);
}
