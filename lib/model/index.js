import { assign } from 'min-dash';
import inherits from 'inherits-browser';

import Refs from 'object-refs';

var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
    labelRefs = new Refs({ name: 'labels', enumerable: true, collection: true }, { name: 'labelTarget' }),
    attacherRefs = new Refs({ name: 'attachers', collection: true }, { name: 'host' }),
    outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
    incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });

/**
 * @typedef {import('./Types').Base} Base
 * @typedef {import('./Types').Shape} Shape
 * @typedef {import('./Types').Root} Root
 * @typedef {import('./Types').Label} Label
 * @typedef {import('./Types').Connection} Connection
 */

/**
 * The basic graphical representation
 *
 * @class
 * @constructor
 */
function BaseImpl() {

  /**
   * The object that backs up the shape
   *
   * @name Base#businessObject
   * @type Object
   */
  Object.defineProperty(this, 'businessObject', {
    writable: true
  });


  /**
   * Single label support, will mapped to multi label array
   *
   * @name Base#label
   * @type Object
   */
  Object.defineProperty(this, 'label', {
    get: function() {
      return this.labels[0];
    },
    set: function(newLabel) {

      var label = this.label,
          labels = this.labels;

      if (!newLabel && label) {
        labels.remove(label);
      } else {
        labels.add(newLabel, 0);
      }
    }
  });

  /**
   * The parent shape
   *
   * @name Base#parent
   * @type Shape
   */
  parentRefs.bind(this, 'parent');

  /**
   * The list of labels
   *
   * @name Base#labels
   * @type Label
   */
  labelRefs.bind(this, 'labels');

  /**
   * The list of outgoing connections
   *
   * @name Base#outgoing
   * @type Array<Connection>
   */
  outgoingRefs.bind(this, 'outgoing');

  /**
   * The list of incoming connections
   *
   * @name Base#incoming
   * @type Array<Connection>
   */
  incomingRefs.bind(this, 'incoming');
}


/**
 * A graphical object
 *
 * @class
 * @constructor
 *
 * @extends BaseImpl
 */
function ShapeImpl() {
  BaseImpl.call(this);

  /**
   * Indicates frame shapes
   *
   * @name Shape#isFrame
   * @type boolean
   */

  /**
   * The list of children
   *
   * @name Shape#children
   * @type Array<Base>
   */
  parentRefs.bind(this, 'children');

  /**
   * @name Shape#host
   * @type Shape
   */
  attacherRefs.bind(this, 'host');

  /**
   * @name Shape#attachers
   * @type Shape
   */
  attacherRefs.bind(this, 'attachers');
}

inherits(ShapeImpl, BaseImpl);


/**
 * A root graphical object
 *
 * @class
 * @constructor
 *
 * @extends ShapeImpl
 */
function RootImpl() {
  ShapeImpl.call(this);
}

inherits(RootImpl, ShapeImpl);


/**
 * A label for an element
 *
 * @class
 * @constructor
 *
 * @extends ShapeImpl
 */
function LabelImpl() {
  ShapeImpl.call(this);

  /**
   * The labeled element
   *
   * @name LabelImpl#labelTarget
   * @type Base
   */
  labelRefs.bind(this, 'labelTarget');
}

inherits(LabelImpl, ShapeImpl);


/**
 * A connection between two elements
 *
 * @class
 * @constructor
 *
 * @extends BaseImpl
 */
function ConnectionImpl() {
  BaseImpl.call(this);

  /**
   * The element this connection originates from
   *
   * @name Connection#source
   * @type Base
   */
  outgoingRefs.bind(this, 'source');

  /**
   * The element this connection points to
   *
   * @name Connection#target
   * @type Base
   */
  incomingRefs.bind(this, 'target');
}

inherits(ConnectionImpl, BaseImpl);


var types = {
  connection: ConnectionImpl,
  shape: ShapeImpl,
  label: LabelImpl,
  root: RootImpl
};

/**
 * Creates a model element of the given type.
 *
 * @example
 *
 * ```
 * import * as Model from 'diagram-js/lib/model';
 *
 * const connection = Model.create('connection', {
 *   waypoints: [
 *     { x: 100, y: 100 },
 *     { x: 200, y: 100 }
 *   ]
 * });
 *
 * const label = Model.create('label', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100,
 *   labelTarget: shape
 * });
 *
 * const root = Model.create('root', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 *
 * const shape = Model.create('shape', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 * ```
 *
 * @overload
 * @param {'root'} type
 * @param {any} [attrs]
 * @return {Root}
 *
 * @overload
 * @param {'shape'} type
 * @param {any} [attrs]
 * @return {Shape}
 *
 * @overload
 * @param {'label'} type
 * @param {any} [attrs]
 * @return {Label}
 *
 * @overload
 * @param {'connection'} type
 * @param {any} [attrs]
 * @return {Connection}
 */
export function create(type, attrs) {
  var Type = types[type];
  if (!Type) {
    throw new Error('unknown type: <' + type + '>');
  }
  return assign(new Type(), attrs);
}

/**
 * Checks whether an object is a model instance.
 *
 * @param {any} obj
 * @return {boolean}
 */
export function isModelElement(obj) {
  return obj instanceof BaseImpl;
}