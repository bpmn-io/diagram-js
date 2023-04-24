import {
  sortBy,
  forEach,
  isArray
} from 'min-dash';

/**
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef {import('../../util/Types').Axis} Axis
 * @typedef {import('../../util/Types').Dimension} Dimension
 * @typedef {import('../../util/Types').Rect} Rect
 *
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../rules/Rules').default} Rules
 *
 * @typedef { {
 *   min: number;
 *   max: number;
 * } } Range
 *
 * @typedef { {
 *   elements: Element[];
 *   range: Range;
 * } } Group
 */

var AXIS_DIMENSIONS = {
  horizontal: [ 'x', 'width' ],
  vertical: [ 'y', 'height' ]
};

var THRESHOLD = 5;


/**
 * Groups and filters elements and then trigger even distribution.
 *
 * @param {Modeling} modeling
 * @param {Rules} rules
 */
export default function DistributeElements(modeling, rules) {
  this._modeling = modeling;

  this._filters = [];

  this.registerFilter(function(elements) {
    var allowed = rules.allowed('elements.distribute', { elements: elements });

    if (isArray(allowed)) {
      return allowed;
    }

    return allowed ? elements : [];
  });
}

DistributeElements.$inject = [ 'modeling', 'rules' ];


/**
 * Registers filter functions that allow external parties to filter
 * out certain elements.
 *
 * @param {(distributableElements: Element[], axis: Axis, dimension: Dimension) => Element[]} filterFn
 */
DistributeElements.prototype.registerFilter = function(filterFn) {
  if (typeof filterFn !== 'function') {
    throw new Error('the filter has to be a function');
  }

  this._filters.push(filterFn);
};

/**
 * Distributes the elements with a given orientation
 *
 * @param {Element[]} elements
 * @param {string} orientation
 */
DistributeElements.prototype.trigger = function(elements, orientation) {
  var modeling = this._modeling;

  var groups,
      distributableElements;

  if (elements.length < 3) {
    return;
  }

  this._setOrientation(orientation);

  distributableElements = this._filterElements(elements);

  groups = this._createGroups(distributableElements);

  // nothing to distribute
  if (groups.length <= 2) {
    return;
  }

  modeling.distributeElements(groups, this._axis, this._dimension);

  return groups;
};

/**
 * Filters the elements with provided filters by external parties
 *
 * @param {Element[]} elements
 *
 * @return {Element[]}
 */
DistributeElements.prototype._filterElements = function(elements) {
  var filters = this._filters,
      axis = this._axis,
      dimension = this._dimension,
      distributableElements = [].concat(elements);

  if (!filters.length) {
    return elements;
  }

  forEach(filters, function(filterFn) {
    distributableElements = filterFn(distributableElements, axis, dimension);
  });

  return distributableElements;
};


/**
 * Create range (min, max) groups. Also tries to group elements
 * together that share the same range.
 *
 * @example
 *
 * ```javascript
 *   const groups = [
 *     {
 *       range: { min: 100, max: 200 },
 *       elements: [ { id: 'shape1', ... } ]
 *     }
 *   ]
 * ```
 *
 * @param {Element[]} elements
 *
 * @return {Group[]}
 */
DistributeElements.prototype._createGroups = function(elements) {
  var rangeGroups = [],
      self = this,
      axis = this._axis,
      dimension = this._dimension;

  if (!axis) {
    throw new Error('must have a defined "axis" and "dimension"');
  }

  // sort by 'left->right' or 'top->bottom'
  var sortedElements = sortBy(elements, axis);

  forEach(sortedElements, function(element, idx) {
    var elementRange = self._findRange(element, axis, dimension),
        range;

    var previous = rangeGroups[rangeGroups.length - 1];

    if (previous && self._hasIntersection(previous.range, elementRange)) {
      rangeGroups[rangeGroups.length - 1].elements.push(element);
    } else {
      range = { range: elementRange, elements: [ element ] };

      rangeGroups.push(range);
    }
  });

  return rangeGroups;
};


/**
 * Maps a direction to the according axis and dimension.
 *
 * @param {'horizontal' | 'vertical'} direction 'horizontal' or 'vertical'
 */
DistributeElements.prototype._setOrientation = function(direction) {
  var orientation = AXIS_DIMENSIONS[direction];

  this._axis = orientation[0];
  this._dimension = orientation[1];
};


/**
 * Checks if the two ranges intercept each other.
 *
 * @param {Range} rangeA
 * @param {Range} rangeB
 *
 * @return {boolean}
 */
DistributeElements.prototype._hasIntersection = function(rangeA, rangeB) {
  return Math.max(rangeA.min, rangeA.max) >= Math.min(rangeB.min, rangeB.max) &&
         Math.min(rangeA.min, rangeA.max) <= Math.max(rangeB.min, rangeB.max);
};


/**
 * Returns the min and max values for an element
 *
 * @param {Element} element
 *
 * @return {Range}
 */
DistributeElements.prototype._findRange = function(element) {
  var axis = element[this._axis],
      dimension = element[this._dimension];

  return {
    min: axis + THRESHOLD,
    max: axis + dimension - THRESHOLD
  };
};
