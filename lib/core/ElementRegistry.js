const ELEMENT_ID = 'data-element-id';

import { attr as svgAttr } from 'tiny-svg';


/**
 * @class
 *
 * A registry that keeps track of all shapes in the diagram.
 */
export default class ElementRegistry {
  constructor(eventBus) {
    this._elements = {};

    this._eventBus = eventBus;
  }

  /**
   * Register a pair of (element, gfx, (secondaryGfx)).
   *
   * @param {djs.model.Base} element
   * @param {SVGElement} gfx
   * @param {SVGElement} [secondaryGfx] optional other element to register, too
   */
  add(element, gfx, secondaryGfx) {

    const id = element.id;

    this._validateId(id);

    // associate dom node with element
    svgAttr(gfx, ELEMENT_ID, id);

    if (secondaryGfx) {
      svgAttr(secondaryGfx, ELEMENT_ID, id);
    }

    this._elements[id] = { element, gfx, secondaryGfx };
  }

  /**
   * Removes an element from the registry.
   *
   * @param {djs.model.Base} element
   */
  remove(element) {
    const elements = this._elements;
    const id = element.id || element;
    const container = id && elements[id];

    if (container) {

      // unset element id on gfx
      svgAttr(container.gfx, ELEMENT_ID, '');

      if (container.secondaryGfx) {
        svgAttr(container.secondaryGfx, ELEMENT_ID, '');
      }

      delete elements[id];
    }
  }

  /**
   * Update the id of an element
   *
   * @param {djs.model.Base} element
   * @param {string} newId
   */
  updateId(element, newId) {
    this._validateId(newId);

    if (typeof element === 'string') {
      element = this.get(element);
    }

    this._eventBus.fire('element.updateId', {
      element,
      newId
    });

    const gfx = this.getGraphics(element);
    const secondaryGfx = this.getGraphics(element, true);

    this.remove(element);

    element.id = newId;

    this.add(element, gfx, secondaryGfx);
  }

  /**
   * Return the model element for a given id or graphics.
   *
   * @example
   *
   * elementRegistry.get('SomeElementId_1');
   * elementRegistry.get(gfx);
   *
   *
   * @param {string|SVGElement} filter for selecting the element
   *
   * @return {djs.model.Base}
   */
  get(filter) {
    let id;

    if (typeof filter === 'string') {
      id = filter;
    } else {
      id = filter && svgAttr(filter, ELEMENT_ID);
    }

    const container = this._elements[id];
    return container && container.element;
  }

  /**
   * Return all elements that match a given filter function.
   *
   * @param {Function} fn
   *
   * @return {Array<djs.model.Base>}
   */
  filter(fn) {

    const filtered = [];

    this.forEach((element, gfx) => {
      if (fn(element, gfx)) {
        filtered.push(element);
      }
    });

    return filtered;
  }

  /**
   * Return all rendered model elements.
   *
   * @return {Array<djs.model.Base>}
   */
  getAll() {
    return this.filter(e => { return e; });
  }

  /**
   * Iterate over all diagram elements.
   *
   * @param {Function} fn
   */
  forEach(fn) {

    const map = this._elements;

    Object.keys(map).forEach(id => {
      const container = map[id];
      const element = container.element;
      const gfx = container.gfx;

      return fn(element, gfx);
    });
  }

  /**
   * Return the graphical representation of an element or its id.
   *
   * @example
   * elementRegistry.getGraphics('SomeElementId_1');
   * elementRegistry.getGraphics(rootElement); // <g ...>
   *
   * elementRegistry.getGraphics(rootElement, true); // <svg ...>
   *
   *
   * @param {string|djs.model.Base} filter
   * @param {boolean} [secondary=false] whether to return the secondary connected element
   *
   * @return {SVGElement}
   */
  getGraphics(filter, secondary) {
    const id = filter.id || filter;

    const container = this._elements[id];
    return container && (secondary ? container.secondaryGfx : container.gfx);
  }

  /**
   * Validate the suitability of the given id and signals a problem
   * with an exception.
   *
   * @param {string} id
   *
   * @throws {Error} if id is empty or already assigned
   */
  _validateId(id) {
    if (!id) {
      throw new Error('element must have an id');
    }

    if (this._elements[id]) {
      throw new Error(`element with id ${id} already added`);
    }
  }
}

ElementRegistry.$inject = [ 'eventBus' ];
