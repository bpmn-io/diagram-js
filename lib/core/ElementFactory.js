import {
  create, isModelElement
} from '../model';

import { assign } from 'min-dash';

/**
 * @typedef {import('../model/Types').Base} Base
 * @typedef {import('../model/Types').Connection} Connection
 * @typedef {import('../model/Types').Label} Label
 * @typedef {import('../model/Types').Root} Root
 * @typedef {import('../model/Types').Shape} Shape
 */

/**
 * A factory for model elements.
 *
 * @class
 * @constructor
 */
export default function ElementFactory() {
  this._uid = 12;
}

/**
 * Create a root element.
 *
 * @param {Partial<Root>} [attrs]
 *
 * @return {Root} The created root element.
 */
ElementFactory.prototype.createRoot = function(attrs) {
  return this.create('root', attrs);
};

/**
 * Create a label.
 *
 * @param {Partial<Label>} [attrs]
 *
 * @return {Label} The created label.
 */
ElementFactory.prototype.createLabel = function(attrs) {
  return this.create('label', attrs);
};

/**
 * Create a shape.
 *
 * @param {Partial<Shape>} [attrs]
 *
 * @return {Shape} The created shape.
 */
ElementFactory.prototype.createShape = function(attrs) {
  return this.create('shape', attrs);
};

/**
 * Create a connection.
 *
 * @param {Partial<Connection>} [attrs]
 *
 * @return {Connection} The created connection.
 */
ElementFactory.prototype.createConnection = function(attrs) {
  return this.create('connection', attrs);
};

/**
 * Create a root element.
 *
 * @overlord
 * @param {'root'} type
 * @param {Partial<Root>} [attrs]
 * @return {Root}
 */
/**
 * Create a shape.
 *
 * @overlord
 * @param {'shape'} type
 * @param {Partial<Shape>} [attrs]
 * @return {Shape}
 */
/**
 * Create a connection.
 *
 * @overlord
 * @param {'connection'} type
 * @param {Partial<Connection>} [attrs]
 * @return {Connection}
 */
/**
 * Create a label.
 *
 * @param {'label'} type
 * @param {Partial<Label>} [attrs]
 * @return {Label}
 */
ElementFactory.prototype.create = function(type, attrs) {

  if (isModelElement(attrs)) {
    return attrs;
  }

  attrs = assign({}, attrs || {});

  if (!attrs.id) {
    attrs.id = type + '_' + (this._uid++);
  }

  return create(type, attrs);
};