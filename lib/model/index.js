import { assign } from 'min-dash';
import inherits from 'inherits-browser';

import Refs from 'object-refs';

var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
    labelRefs = new Refs({ name: 'labels', enumerable: true, collection: true }, { name: 'labelTarget' }),
    attacherRefs = new Refs({ name: 'attachers', collection: true }, { name: 'host' }),
    outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
    incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });

/**
 * @typedef {import('./Types').Element} Element
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
function ElementImpl() {

  /**
   * The object that backs up the shape
   *
   * @name Element#businessObject
   * @type Object
   */
  Object.defineProperty(this, 'businessObject', {
    writable: true
  });


  /**
   * Single label support, will mapped to multi label array
   *
   * @name Element#label
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
   * @name Element#parent
   * @type Shape
   */
  parentRefs.bind(this, 'parent');

  /**
   * The list of labels
   *
   * @name Element#labels
   * @type Label
   */
  labelRefs.bind(this, 'labels');

  /**
   * The list of outgoing connections
   *
   * @name Element#outgoing
   * @type Array<Connection>
   */
  outgoingRefs.bind(this, 'outgoing');

  /**
   * The list of incoming connections
   *
   * @name Element#incoming
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
 * @extends ElementImpl
 */
function ShapeImpl() {
  ElementImpl.call(this);

  /**
   * Indicates frame shapes
   *
   * @name ShapeImpl#isFrame
   * @type boolean
   */

  /**
   * The list of children
   *
   * @name ShapeImpl#children
   * @type Element[]
   */
  parentRefs.bind(this, 'children');

  /**
   * @name ShapeImpl#host
   * @type Shape
   */
  attacherRefs.bind(this, 'host');

  /**
   * @name ShapeImpl#attachers
   * @type Shape
   */
  attacherRefs.bind(this, 'attachers');
}

inherits(ShapeImpl, ElementImpl);


/**
 * A root graphical object
 *
 * @class
 * @constructor
 *
 * @extends ElementImpl
 */
function RootImpl() {
  ElementImpl.call(this);

  /**
   * The list of children
   *
   * @name RootImpl#children
   * @type Element[]
   */
  parentRefs.bind(this, 'children');
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
   * @type Element
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
 * @extends ElementImpl
 */
function ConnectionImpl() {
  ElementImpl.call(this);

  /**
   * The element this connection originates from
   *
   * @name ConnectionImpl#source
   * @type Element
   */
  outgoingRefs.bind(this, 'source');

  /**
   * The element this connection points to
   *
   * @name ConnectionImpl#target
   * @type Element
   */
  incomingRefs.bind(this, 'target');
}

inherits(ConnectionImpl, ElementImpl);


var types = {
  connection: ConnectionImpl,
  shape: ShapeImpl,
  label: LabelImpl,
  root: RootImpl
};

/**
 * Creates a root element.
 *
 * @overlord
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const root = Model.create('root', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 * ```
 *
 * @param {'root'} type
 * @param {any} [attrs]
 *
 * @return {Root}
 */

/**
 * Creates a connection.
 *
 * @overlord
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const connection = Model.create('connection', {
 *   waypoints: [
 *     { x: 100, y: 100 },
 *     { x: 200, y: 100 }
 *   ]
 * });
 * ```
 *
 * @param {'connection'} type
 * @param {any} [attrs]
 *
 * @return {Connection}
 */

/**
 * Creates a shape.
 *
 * @overlord
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const shape = Model.create('shape', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 * ```
 *
 * @param {'shape'} type
 * @param {any} [attrs]
 *
 * @return {Shape}
 */

/**
 * Creates a label.
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const label = Model.create('label', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100,
 *   labelTarget: shape
 * });
 * ```
 *
 * @param {'label'} type
 * @param {Object} [attrs]
 *
 * @return {Label}
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
 *
 * @return {boolean}
 */
export function isModelElement(obj) {
  return obj instanceof ElementImpl;
}