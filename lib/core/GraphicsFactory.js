import {
  forEach,
  reduce
} from 'min-dash';

import {
  getChildren,
  getVisual
} from '../util/GraphicsUtil';

import { translate } from '../util/SvgTransformUtil';

import { clear as domClear } from 'min-dom';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  isFrameElement
} from '../util/Elements';

/**
 * @typedef {import('./Types').ConnectionLike} ConnectionLike
 * @typedef {import('./Types').ElementLike} ElementLike
 * @typedef {import('./Types').ShapeLike} ShapeLike
 *
 * @typedef {import('./ElementRegistry').default} ElementRegistry
 * @typedef {import('./EventBus').default} EventBus
 */

/**
 * A factory that creates graphical elements.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default function GraphicsFactory(eventBus, elementRegistry) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
}

GraphicsFactory.$inject = [ 'eventBus' , 'elementRegistry' ];

/**
 * @param { { parent?: any } } element
 * @return {SVGElement}
 */
GraphicsFactory.prototype._getChildrenContainer = function(element) {

  var gfx = this._elementRegistry.getGraphics(element);

  var childrenGfx;

  // root element
  if (!element.parent) {
    childrenGfx = gfx;
  } else {
    childrenGfx = getChildren(gfx);
    if (!childrenGfx) {
      childrenGfx = svgCreate('g');
      svgClasses(childrenGfx).add('djs-children');

      svgAppend(gfx.parentNode, childrenGfx);
    }
  }

  return childrenGfx;
};

/**
 * Clears the graphical representation of the element and returns the
 * cleared visual (the <g class="djs-visual" /> element).
 */
GraphicsFactory.prototype._clear = function(gfx) {
  var visual = getVisual(gfx);

  domClear(visual);

  return visual;
};

/**
 * Creates a gfx container for shapes and connections
 *
 * The layout is as follows:
 *
 * <g class="djs-group">
 *
 *   <!-- the gfx -->
 *   <g class="djs-element djs-(shape|connection|frame)">
 *     <g class="djs-visual">
 *       <!-- the renderer draws in here -->
 *     </g>
 *
 *     <!-- extensions (overlays, click box, ...) goes here
 *   </g>
 *
 *   <!-- the gfx child nodes -->
 *   <g class="djs-children"></g>
 * </g>
 *
 * @param {string} type the type of the element, i.e. shape | connection
 * @param {SVGElement} childrenGfx
 * @param {number} [parentIndex] position to create container in parent
 * @param {boolean} [isFrame] is frame element
 *
 * @return {SVGElement}
 */
GraphicsFactory.prototype._createContainer = function(
    type, childrenGfx, parentIndex, isFrame
) {
  var outerGfx = svgCreate('g');
  svgClasses(outerGfx).add('djs-group');

  // insert node at position
  if (typeof parentIndex !== 'undefined') {
    prependTo(outerGfx, childrenGfx, childrenGfx.childNodes[parentIndex]);
  } else {
    svgAppend(childrenGfx, outerGfx);
  }

  var gfx = svgCreate('g');
  svgClasses(gfx).add('djs-element');
  svgClasses(gfx).add('djs-' + type);

  if (isFrame) {
    svgClasses(gfx).add('djs-frame');
  }

  svgAppend(outerGfx, gfx);

  // create visual
  var visual = svgCreate('g');
  svgClasses(visual).add('djs-visual');

  svgAppend(gfx, visual);

  return gfx;
};

/**
 * Create a graphical element.
 *
 * @param { 'shape' | 'connection' | 'label' | 'root' } type The type of the element.
 * @param {ElementLike} element The element.
 * @param {number} [parentIndex] The index at which to add the graphical element to its parent's children.
 *
 * @return {SVGElement} The graphical element.
 */
GraphicsFactory.prototype.create = function(type, element, parentIndex) {
  var childrenGfx = this._getChildrenContainer(element.parent);
  return this._createContainer(type, childrenGfx, parentIndex, isFrameElement(element));
};

/**
 * Update the containments of the given elements.
 *
 * @param {ElementLike[]} elements The elements.
 */
GraphicsFactory.prototype.updateContainments = function(elements) {

  var self = this,
      elementRegistry = this._elementRegistry,
      parents;

  parents = reduce(elements, function(map, e) {

    if (e.parent) {
      map[e.parent.id] = e.parent;
    }

    return map;
  }, {});

  // update all parents of changed and reorganized their children
  // in the correct order (as indicated in our model)
  forEach(parents, function(parent) {

    var children = parent.children;

    if (!children) {
      return;
    }

    var childrenGfx = self._getChildrenContainer(parent);

    forEach(children.slice().reverse(), function(child) {
      var childGfx = elementRegistry.getGraphics(child);

      prependTo(childGfx.parentNode, childrenGfx);
    });
  });
};

/**
 * Draw a shape.
 *
 * @param {SVGElement} visual The graphical element.
 * @param {ShapeLike} element The shape.
 *
 * @return {SVGElement}
 */
GraphicsFactory.prototype.drawShape = function(visual, element) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.shape', { gfx: visual, element: element });
};

/**
 * Get the path of a shape.
 *
 * @param {ShapeLike} element The shape.
 *
 * @return {string} The path of the shape.
 */
GraphicsFactory.prototype.getShapePath = function(element) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.getShapePath', element);
};

/**
 * Draw a connection.
 *
 * @param {SVGElement} visual The graphical element.
 * @param {ConnectionLike} element The connection.
 *
 * @return {SVGElement}
 */
GraphicsFactory.prototype.drawConnection = function(visual, element) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.connection', { gfx: visual, element: element });
};

/**
 * Get the path of a connection.
 *
 * @param {ConnectionLike} connection The connection.
 *
 * @return {string} The path of the connection.
 */
GraphicsFactory.prototype.getConnectionPath = function(connection) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.getConnectionPath', connection);
};

/**
 * Update an elements graphical representation.
 *
 * @param {'shape'|'connection'} type
 * @param {ElementLike} element
 * @param {SVGElement} gfx
 */
GraphicsFactory.prototype.update = function(type, element, gfx) {

  // do NOT update root element
  if (!element.parent) {
    return;
  }

  var visual = this._clear(gfx);

  // redraw
  if (type === 'shape') {
    this.drawShape(visual, element);

    // update positioning
    translate(gfx, element.x, element.y);
  } else
  if (type === 'connection') {
    this.drawConnection(visual, element);
  } else {
    throw new Error('unknown type: ' + type);
  }

  if (element.hidden) {
    svgAttr(gfx, 'display', 'none');
  } else {
    svgAttr(gfx, 'display', 'block');
  }
};

/**
 * Remove a graphical element.
 *
 * @param {ElementLike} element The element.
 */
GraphicsFactory.prototype.remove = function(element) {
  var gfx = this._elementRegistry.getGraphics(element);

  // remove
  svgRemove(gfx.parentNode);
};


// helpers //////////

function prependTo(newNode, parentNode, siblingNode) {
  var node = siblingNode || parentNode.firstChild;

  // do not prepend node to itself to prevent IE from crashing
  // https://github.com/bpmn-io/bpmn-js/issues/746
  if (newNode === node) {
    return;
  }

  parentNode.insertBefore(newNode, node);
}
