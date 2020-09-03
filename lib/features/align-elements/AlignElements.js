import {
  filter,
  forEach,
  sortBy
} from 'min-dash';

function last(arr) {
  return arr && arr[arr.length - 1];
}

function sortTopOrMiddle({y}) {
  return y;
}

function sortLeftOrCenter({x}) {
  return x;
}

/**
 * Sorting functions for different types of alignment
 *
 * @type {Object}
 *
 * @return {Function}
 */
const ALIGNMENT_SORTING = {
  left: sortLeftOrCenter,
  center: sortLeftOrCenter,
  right({x, width}) {
    return x + width;
  },
  top: sortTopOrMiddle,
  middle: sortTopOrMiddle,
  bottom({y, height}) {
    return y + height;
  }
};


export default class AlignElements {
  constructor(modeling) {
    this._modeling = modeling;
  }

  /**
   * Get the relevant "axis" and "dimension" related to the current type of alignment
   *
   * @param  {string} type left|right|center|top|bottom|middle
   *
   * @return {Object} { axis, dimension }
   */
  _getOrientationDetails(type) {
    const vertical = [ 'top', 'bottom', 'middle' ];
    let axis = 'x';
    let dimension = 'width';

    if (vertical.includes(type)) {
      axis = 'y';
      dimension = 'height';
    }

    return {
      axis,
      dimension
    };
  }

  _isType(type, types) {
    return types.includes(type);
  }

  /**
   * Get a point on the relevant axis where elements should align to
   *
   * @param  {string} type left|right|center|top|bottom|middle
   * @param  {Array} sortedElements
   *
   * @return {Object}
   */
  _alignmentPosition(type, sortedElements) {
    const orientation = this._getOrientationDetails(type);
    const axis = orientation.axis;
    const dimension = orientation.dimension;
    const alignment = {};
    const centers = {};
    let hasSharedCenters = false;
    let centeredElements;
    let firstElement;
    let lastElement;

    function getMiddleOrTop(first, last) {
      return Math.round((first[axis] + last[axis] + last[dimension]) / 2);
    }

    if (this._isType(type, [ 'left', 'top' ])) {
      alignment[type] = sortedElements[0][axis];

    } else if (this._isType(type, [ 'right', 'bottom' ])) {
      lastElement = last(sortedElements);

      alignment[type] = lastElement[axis] + lastElement[dimension];

    } else if (this._isType(type, [ 'center', 'middle' ])) {

      // check if there is a center shared by more than one shape
      // if not, just take the middle of the range
      forEach(sortedElements, element => {
        const center = element[axis] + Math.round(element[dimension] / 2);

        if (centers[center]) {
          centers[center].elements.push(element);
        } else {
          centers[center] = {
            elements: [ element ],
            center
          };
        }
      });

      centeredElements = sortBy(centers, ({elements}) => {
        if (elements.length > 1) {
          hasSharedCenters = true;
        }

        return elements.length;
      });

      if (hasSharedCenters) {
        alignment[type] = last(centeredElements).center;

        return alignment;
      }

      firstElement = sortedElements[0];

      sortedElements = sortBy(sortedElements, element => {
        return element[axis] + element[dimension];
      });

      lastElement = last(sortedElements);

      alignment[type] = getMiddleOrTop(firstElement, lastElement);
    }

    return alignment;
  }

  /**
   * Executes the alignment of a selection of elements
   *
   * @param  {Array} elements [description]
   * @param  {string} type left|right|center|top|bottom|middle
   */
  trigger(elements, type) {
    const modeling = this._modeling;

    const filteredElements = filter(elements, ({waypoints, host, labelTarget}) => {
      return !(waypoints || host || labelTarget);
    });

    const sortFn = ALIGNMENT_SORTING[type];

    const sortedElements = sortBy(filteredElements, sortFn);

    const alignment = this._alignmentPosition(type, sortedElements);

    modeling.alignElements(sortedElements, alignment);
  }
}

AlignElements.$inject = [ 'modeling' ];
