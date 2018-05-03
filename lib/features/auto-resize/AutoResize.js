import inherits from 'inherits';

import { getBBox as getBoundingBox } from '../../util/Elements';

import {
  asTRBL,
  asBounds
} from '../../layout/LayoutUtil';

import {
  assign,
  flatten,
  forEach,
  isArray,
  values,
  groupBy
} from 'min-dash';

import CommandInterceptor from '../../command/CommandInterceptor';


/**
 * An auto resize component that takes care of expanding a parent element
 * if child elements are created or moved close the parents edge.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Modeling} modeling
 * @param {Rules} rules
 */
export default function AutoResize(eventBus, elementRegistry, modeling, rules) {

  CommandInterceptor.call(this, eventBus);

  this._elementRegistry = elementRegistry;
  this._modeling = modeling;
  this._rules = rules;

  var self = this;

  this.postExecuted([ 'shape.create' ], function(event) {
    var context = event.context,
        hints = context.hints,
        shape = context.shape,
        parent = context.parent || context.newParent;

    if (hints && (hints.root === false || hints.autoResize === false)) {
      return;
    }

    self._expand([ shape ], parent);
  });

  this.postExecuted([ 'elements.move' ], function(event) {
    var context = event.context,
        elements = flatten(values(context.closure.topLevel)),
        hints = context.hints;

    var autoResize = hints ? hints.autoResize : true;

    if (autoResize === false) {
      return;
    }

    var expandings = groupBy(elements, function(element) {
      return element.parent.id;
    });

    forEach(expandings, function(elements, parentId) {

      // optionally filter elements to be considered when resizing
      if (isArray(autoResize)) {
        elements = elements.filter(function(element) {
          return autoResize.indexOf(element) !== -1;
        });
      }

      self._expand(elements, parentId);
    });
  });
}

AutoResize.$inject = [
  'eventBus',
  'elementRegistry',
  'modeling',
  'rules'
];

inherits(AutoResize, CommandInterceptor);


/**
 * Calculate the new bounds of the target shape, given
 * a number of elements have been moved or added into the parent.
 *
 * This method considers the current size, the added elements as well as
 * the provided padding for the new bounds.
 *
 * @param {Array<djs.model.Shape>} elements
 * @param {djs.model.Shape} target
 */
AutoResize.prototype._getOptimalBounds = function(elements, target) {

  var offset = this.getOffset(target),
      padding = this.getPadding(target);

  var elementsTrbl = asTRBL(getBoundingBox(elements)),
      targetTrbl = asTRBL(target);

  var newTrbl = {};

  if (elementsTrbl.top - targetTrbl.top < padding.top) {
    newTrbl.top = elementsTrbl.top - offset.top;
  }

  if (elementsTrbl.left - targetTrbl.left < padding.left) {
    newTrbl.left = elementsTrbl.left - offset.left;
  }

  if (targetTrbl.right - elementsTrbl.right < padding.right) {
    newTrbl.right = elementsTrbl.right + offset.right;
  }

  if (targetTrbl.bottom - elementsTrbl.bottom < padding.bottom) {
    newTrbl.bottom = elementsTrbl.bottom + offset.bottom;
  }

  return asBounds(assign({}, targetTrbl, newTrbl));
};


/**
 * Expand the target shape respecting rules, offset and padding
 *
 * @param {Array<djs.model.Shape>} elements
 * @param {djs.model.Shape|String} target|targetId
 */
AutoResize.prototype._expand = function(elements, target) {

  if (typeof target === 'string') {
    target = this._elementRegistry.get(target);
  }

  var allowed = this._rules.allowed('element.autoResize', {
    elements: elements,
    target: target
  });

  if (!allowed) {
    return;
  }

  // calculate the new bounds
  var newBounds = this._getOptimalBounds(elements, target);

  if (!boundsChanged(newBounds, target)) {
    return;
  }

  // resize the parent shape
  this.resize(target, newBounds);

  var parent = target.parent;

  // recursively expand parent elements
  if (parent) {
    this._expand([ target ], parent);
  }
};


/**
 * Get the amount to expand the given shape in each direction.
 *
 * @param {djs.model.Shape} shape
 *
 * @return {Object} {top, bottom, left, right}
 */
AutoResize.prototype.getOffset = function(shape) {
  return { top: 60, bottom: 60, left: 100, right: 100 };
};


/**
 * Get the activation threshold for each side for which
 * resize triggers.
 *
 * @param {djs.model.Shape} shape
 *
 * @return {Object} {top, bottom, left, right}
 */
AutoResize.prototype.getPadding = function(shape) {
  return { top: 2, bottom: 2, left: 15, right: 15 };
};


/**
 * Perform the actual resize operation.
 *
 * @param {djs.model.Shape} target
 * @param {Object} newBounds
 */
AutoResize.prototype.resize = function(target, newBounds) {
  this._modeling.resizeShape(target, newBounds);
};


function boundsChanged(newBounds, oldBounds) {
  return (
    newBounds.x !== oldBounds.x ||
    newBounds.y !== oldBounds.y ||
    newBounds.width !== oldBounds.width ||
    newBounds.height !== oldBounds.height
  );
}