import {
  create
} from '../model';

import { assign } from 'min-dash';

/**
 * @typedef {import('../model/index').Base} Base
 * @typedef {import('../model/index').Connection} Connection
 * @typedef {import('../model/index').Label} Label
 * @typedef {import('../model/index').Root} Root
 * @typedef {import('../model/index').Shape} Shape
 * @typedef {import('../model/index').ModelAttrsConnection} ModelAttrsConnection
 * @typedef {import('../model/index').ModelAttrsLabel} ModelAttrsLabel
 * @typedef {import('../model/index').ModelAttrsRoot} ModelAttrsRoot
 * @typedef {import('../model/index').ModelAttrsShape} ModelAttrsShape
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
 * @param {ModelAttrsRoot} attrs The attributes of the root element to be created.
 *
 * @return {Root} The created root element.
 */
ElementFactory.prototype.createRoot = function(attrs) {
  return this.create('root', attrs);
};

/**
 * Create a label.
 *
 * @param {ModelAttrsLabel} attrs The attributes of the label to be created.
 *
 * @return {Label} The created label.
 */
ElementFactory.prototype.createLabel = function(attrs) {
  return this.create('label', attrs);
};

/**
 * Create a shape.
 *
 * @param {ModelAttrsShape} attrs The attributes of the shape to be created.
 *
 * @return {Shape} The created shape.
 */
ElementFactory.prototype.createShape = function(attrs) {
  return this.create('shape', attrs);
};

/**
 * Create a connection.
 *
 * @param {ModelAttrsConnection} attrs The attributes of the connection to be created.
 *
 * @return {Connection} The created connection.
 */
ElementFactory.prototype.createConnection = function(attrs) {
  return this.create('connection', attrs);
};

/**
 * Create a model element of the given type with the given attributes.
 *
 * @param {string} type The type of the model element.
 * @param {Object} attrs The attributes of the model element.
 *
 * @return {Connection|Label|Root|Shape} The created model element.
 */
ElementFactory.prototype.create = function(type, attrs) {

  attrs = assign({}, attrs || {});

  if (!attrs.id) {
    attrs.id = type + '_' + (this._uid++);
  }

  return create(type, attrs);
};