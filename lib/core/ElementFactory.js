import {
  create
} from '../model';

import { assign } from 'min-dash';

/**
 * @typedef {import('../model/Types').Element} Element
 * @typedef {import('../model/Types').Connection} Connection
 * @typedef {import('../model/Types').Label} Label
 * @typedef {import('../model/Types').Root} Root
 * @typedef {import('../model/Types').Shape} Shape
 */

/**
 * A factory for model elements.
 *
 * @template {Connection} [T=Connection]
 * @template {Label} [U=Label]
 * @template {Root} [V=Root]
 * @template {Shape} [W=Shape]
 */
export default function ElementFactory() {
  this._uid = 12;
}

/**
 * Create a root element.
 *
 * @param {Partial<Root>} [attrs]
 *
 * @return {V} The created root element.
 */
ElementFactory.prototype.createRoot = function(attrs) {
  return this.create('root', attrs);
};

/**
 * Create a label.
 *
 * @param {Partial<Label>} [attrs]
 *
 * @return {U} The created label.
 */
ElementFactory.prototype.createLabel = function(attrs) {
  return this.create('label', attrs);
};

/**
 * Create a shape.
 *
 * @param {Partial<Shape>} [attrs]
 *
 * @return {W} The created shape.
 */
ElementFactory.prototype.createShape = function(attrs) {
  return this.create('shape', attrs);
};

/**
 * Create a connection.
 *
 * @param {Partial<Connection>} [attrs]
 *
 * @return {T} The created connection.
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
 * @return {V}
 */
/**
 * Create a shape.
 *
 * @overlord
 * @param {'shape'} type
 * @param {Partial<Shape>} [attrs]
 * @return {W}
 */
/**
 * Create a connection.
 *
 * @overlord
 * @param {'connection'} type
 * @param {Partial<Connection>} [attrs]
 * @return {T}
 */
/**
 * Create a label.
 *
 * @param {'label'} type
 * @param {Partial<Label>} [attrs]
 * @return {U}
 */
ElementFactory.prototype.create = function(type, attrs) {

  attrs = assign({}, attrs || {});

  if (!attrs.id) {
    attrs.id = type + '_' + (this._uid++);
  }

  return create(type, attrs);
};