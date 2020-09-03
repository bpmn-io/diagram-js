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
 * A factory that creates graphical elements
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default class GraphicsFactory {
  constructor(eventBus, elementRegistry) {
    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
  }

  _getChildrenContainer(element) {

    const gfx = this._elementRegistry.getGraphics(element);

    let childrenGfx;

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
  }

  /**
   * Clears the graphical representation of the element and returns the
   * cleared visual (the <g class="djs-visual" /> element).
   */
  _clear(gfx) {
    const visual = getVisual(gfx);

    domClear(visual);

    return visual;
  }

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
   * @param {SVGElement} [childrenGfx]
   * @param {number} [parentIndex] position to create container in parent
   * @param {boolean} [isFrame] is frame element
   *
   * @return {SVGElement}
   */
  _createContainer(type, childrenGfx, parentIndex, isFrame) {
    const outerGfx = svgCreate('g');
    svgClasses(outerGfx).add('djs-group');

    // insert node at position
    if (typeof parentIndex !== 'undefined') {
      prependTo(outerGfx, childrenGfx, childrenGfx.childNodes[parentIndex]);
    } else {
      svgAppend(childrenGfx, outerGfx);
    }

    const gfx = svgCreate('g');
    svgClasses(gfx).add('djs-element');
    svgClasses(gfx).add(`djs-${type}`);

    if (isFrame) {
      svgClasses(gfx).add('djs-frame');
    }

    svgAppend(outerGfx, gfx);

    // create visual
    const visual = svgCreate('g');
    svgClasses(visual).add('djs-visual');

    svgAppend(gfx, visual);

    return gfx;
  }

  create(type, element, parentIndex) {
    const childrenGfx = this._getChildrenContainer(element.parent);
    return this._createContainer(type, childrenGfx, parentIndex, isFrameElement(element));
  }

  updateContainments(elements) {
    const self = this;
    const elementRegistry = this._elementRegistry;
    let parents;

    parents = reduce(elements, (map, { parent }) => {

      if (parent) {
        map[parent.id] = parent;
      }

      return map;
    }, {});

    // update all parents of changed and reorganized their children
    // in the correct order (as indicated in our model)
    forEach(parents, parent => {

      const children = parent.children;

      if (!children) {
        return;
      }

      const childrenGfx = self._getChildrenContainer(parent);

      forEach(children.slice().reverse(), child => {
        const childGfx = elementRegistry.getGraphics(child);

        prependTo(childGfx.parentNode, childrenGfx);
      });
    });
  }

  drawShape(visual, element) {
    const eventBus = this._eventBus;

    return eventBus.fire('render.shape', { gfx: visual, element });
  }

  getShapePath(element) {
    const eventBus = this._eventBus;

    return eventBus.fire('render.getShapePath', element);
  }

  drawConnection(visual, element) {
    const eventBus = this._eventBus;

    return eventBus.fire('render.connection', { gfx: visual, element });
  }

  getConnectionPath(waypoints) {
    const eventBus = this._eventBus;

    return eventBus.fire('render.getConnectionPath', waypoints);
  }

  update(type, element, gfx) {

    // do NOT update root element
    if (!element.parent) {
      return;
    }

    const visual = this._clear(gfx);

    // redraw
    if (type === 'shape') {
      this.drawShape(visual, element);

      // update positioning
      translate(gfx, element.x, element.y);
    } else
    if (type === 'connection') {
      this.drawConnection(visual, element);
    } else {
      throw new Error(`unknown type: ${type}`);
    }

    if (element.hidden) {
      svgAttr(gfx, 'display', 'none');
    } else {
      svgAttr(gfx, 'display', 'block');
    }
  }

  remove(element) {
    const gfx = this._elementRegistry.getGraphics(element);

    // remove
    svgRemove(gfx.parentNode);
  }
}

GraphicsFactory.$inject = [ 'eventBus' , 'elementRegistry' ];


// helpers //////////

function prependTo(newNode, parentNode, siblingNode) {
  const node = siblingNode || parentNode.firstChild;

  // do not prepend node to itself to prevent IE from crashing
  // https://github.com/bpmn-io/bpmn-js/issues/746
  if (newNode === node) {
    return;
  }

  parentNode.insertBefore(newNode, node);
}
