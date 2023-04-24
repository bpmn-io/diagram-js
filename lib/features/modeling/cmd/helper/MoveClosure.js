import {
  assign
} from 'min-dash';

import {
  getClosure
} from '../../../../util/Elements';

/**
 * @typedef {import('../../../../model/Types').Connection} Connection
 * @typedef {import('../../../../model/Types').Element} Element
 * @typedef {import('../../../../model/Types').Shape} Shape
 */

export default function MoveClosure() {

  /**
   * @type {Record<string, Shape>}
   */
  this.allShapes = {};

  /**
   * @type {Record<string, Connection>}
   */
  this.allConnections = {};

  /**
   * @type {Record<string, Element>}
   */
  this.enclosedElements = {};

  /**
   * @type {Record<string, Connection>}
   */
  this.enclosedConnections = {};

  /**
   * @type {Record<string, Element>}
   */
  this.topLevel = {};
}

/**
 * @param {Element} element
 * @param {boolean} [isTopLevel]
 *
 * @return {MoveClosure}
 */
MoveClosure.prototype.add = function(element, isTopLevel) {
  return this.addAll([ element ], isTopLevel);
};

/**
 * @param {Element[]} elements
 * @param {boolean} [isTopLevel]
 *
 * @return {MoveClosure}
 */
MoveClosure.prototype.addAll = function(elements, isTopLevel) {

  var newClosure = getClosure(elements, !!isTopLevel, this);

  assign(this, newClosure);

  return this;
};