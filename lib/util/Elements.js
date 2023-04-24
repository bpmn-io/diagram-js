import {
  assign,
  filter,
  find,
  isArray,
  isNumber,
  isObject,
  isUndefined,
  groupBy,
  forEach
} from 'min-dash';

/**
 * @typedef {import('../model/Types').Connection} Connection
 * @typedef {import('../model/Types').Element} Element
 * @typedef {import('../model/Types').Shape} Shape
 *
 * @typedef {import('../../type/Types').Rect} Rect
 *
 * @typedef { {
 *   allShapes: Record<string, Shape>,
 *   allConnections: Record<string, Connection>,
 *   topLevel: Record<string, Element>,
 *   enclosedConnections: Record<string, Connection>,
 *   enclosedElements: Record<string, Element>
 * } } Closure
 */

/**
 * Get parent elements.
 *
 * @param {Element[]} elements
 *
 * @return {Element[]}
 */
export function getParents(elements) {

  // find elements that are not children of any other elements
  return filter(elements, function(element) {
    return !find(elements, function(e) {
      return e !== element && getParent(element, e);
    });
  });
}


function getParent(element, parent) {
  if (!parent) {
    return;
  }

  if (element === parent) {
    return parent;
  }

  if (!element.parent) {
    return;
  }

  return getParent(element.parent, parent);
}


/**
 * Adds an element to a collection and returns true if the
 * element was added.
 *
 * @param {Object[]} elements
 * @param {Object} element
 * @param {boolean} [unique]
 */
export function add(elements, element, unique) {
  var canAdd = !unique || elements.indexOf(element) === -1;

  if (canAdd) {
    elements.push(element);
  }

  return canAdd;
}


/**
 * Iterate over each element in a collection, calling the iterator function `fn`
 * with (element, index, recursionDepth).
 *
 * Recurse into all elements that are returned by `fn`.
 *
 * @param {Element|Element[]} elements
 * @param {(element: Element, index: number, depth: number) => Element[] | boolean | undefined} fn
 * @param {number} [depth] maximum recursion depth
 */
export function eachElement(elements, fn, depth) {

  depth = depth || 0;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(s, i) {
    var filter = fn(s, i, depth);

    if (isArray(filter) && filter.length) {
      eachElement(filter, fn, depth + 1);
    }
  });
}


/**
 * Collects self + child elements up to a given depth from a list of elements.
 *
 * @param {Element|Element[]} elements the elements to select the children from
 * @param {boolean} unique whether to return a unique result set (no duplicates)
 * @param {number} maxDepth the depth to search through or -1 for infinite
 *
 * @return {Element[]} found elements
 */
export function selfAndChildren(elements, unique, maxDepth) {
  var result = [],
      processedChildren = [];

  eachElement(elements, function(element, i, depth) {
    add(result, element, unique);

    var children = element.children;

    // max traversal depth not reached yet
    if (maxDepth === -1 || depth < maxDepth) {

      // children exist && children not yet processed
      if (children && add(processedChildren, children, unique)) {
        return children;
      }
    }
  });

  return result;
}

/**
 * Return self + direct children for a number of elements
 *
 * @param {Element[]} elements to query
 * @param {boolean} [allowDuplicates] to allow duplicates in the result set
 *
 * @return {Element[]} the collected elements
 */
export function selfAndDirectChildren(elements, allowDuplicates) {
  return selfAndChildren(elements, !allowDuplicates, 1);
}


/**
 * Return self + ALL children for a number of elements
 *
 * @param {Element[]} elements to query
 * @param {boolean} [allowDuplicates] to allow duplicates in the result set
 *
 * @return {Element[]} the collected elements
 */
export function selfAndAllChildren(elements, allowDuplicates) {
  return selfAndChildren(elements, !allowDuplicates, -1);
}


/**
 * Gets the the closure for all selected elements,
 * their enclosed children and connections.
 *
 * @param {Element[]} elements
 * @param {boolean} [isTopLevel=true]
 * @param {Closure} [closure]
 *
 * @return {Closure} newClosure
 */
export function getClosure(elements, isTopLevel, closure) {

  if (isUndefined(isTopLevel)) {
    isTopLevel = true;
  }

  if (isObject(isTopLevel)) {
    closure = isTopLevel;
    isTopLevel = true;
  }


  closure = closure || {};

  var allShapes = copyObject(closure.allShapes),
      allConnections = copyObject(closure.allConnections),
      enclosedElements = copyObject(closure.enclosedElements),
      enclosedConnections = copyObject(closure.enclosedConnections);

  var topLevel = copyObject(
    closure.topLevel,
    isTopLevel && groupBy(elements, function(e) { return e.id; })
  );


  function handleConnection(c) {
    if (topLevel[c.source.id] && topLevel[c.target.id]) {
      topLevel[c.id] = [ c ];
    }

    // not enclosed as a child, but maybe logically
    // (connecting two moved elements?)
    if (allShapes[c.source.id] && allShapes[c.target.id]) {
      enclosedConnections[c.id] = enclosedElements[c.id] = c;
    }

    allConnections[c.id] = c;
  }

  function handleElement(element) {

    enclosedElements[element.id] = element;

    if (element.waypoints) {

      // remember connection
      enclosedConnections[element.id] = allConnections[element.id] = element;
    } else {

      // remember shape
      allShapes[element.id] = element;

      // remember all connections
      forEach(element.incoming, handleConnection);

      forEach(element.outgoing, handleConnection);

      // recurse into children
      return element.children;
    }
  }

  eachElement(elements, handleElement);

  return {
    allShapes: allShapes,
    allConnections: allConnections,
    topLevel: topLevel,
    enclosedConnections: enclosedConnections,
    enclosedElements: enclosedElements
  };
}

/**
 * Returns the surrounding bbox for all elements in
 * the array or the element primitive.
 *
 * @param {Element|Element[]} elements
 * @param {boolean} [stopRecursion=false]
 *
 * @return {Rect}
 */
export function getBBox(elements, stopRecursion) {

  stopRecursion = !!stopRecursion;
  if (!isArray(elements)) {
    elements = [ elements ];
  }

  var minX,
      minY,
      maxX,
      maxY;

  forEach(elements, function(element) {

    // If element is a connection the bbox must be computed first
    var bbox = element;
    if (element.waypoints && !stopRecursion) {
      bbox = getBBox(element.waypoints, true);
    }

    var x = bbox.x,
        y = bbox.y,
        height = bbox.height || 0,
        width = bbox.width || 0;

    if (x < minX || minX === undefined) {
      minX = x;
    }
    if (y < minY || minY === undefined) {
      minY = y;
    }

    if ((x + width) > maxX || maxX === undefined) {
      maxX = x + width;
    }
    if ((y + height) > maxY || maxY === undefined) {
      maxY = y + height;
    }
  });

  return {
    x: minX,
    y: minY,
    height: maxY - minY,
    width: maxX - minX
  };
}


/**
 * Returns all elements that are enclosed from the bounding box.
 *
 *   * If bbox.(width|height) is not specified the method returns
 *     all elements with element.x/y > bbox.x/y
 *   * If only bbox.x or bbox.y is specified, method return all elements with
 *     e.x > bbox.x or e.y > bbox.y
 *
 * @param {Element[]} elements List of Elements to search through
 * @param {Rect} bbox the enclosing bbox.
 *
 * @return {Element[]} enclosed elements
 */
export function getEnclosedElements(elements, bbox) {

  var filteredElements = {};

  forEach(elements, function(element) {

    var e = element;

    if (e.waypoints) {
      e = getBBox(e);
    }

    if (!isNumber(bbox.y) && (e.x > bbox.x)) {
      filteredElements[element.id] = element;
    }
    if (!isNumber(bbox.x) && (e.y > bbox.y)) {
      filteredElements[element.id] = element;
    }
    if (e.x > bbox.x && e.y > bbox.y) {
      if (isNumber(bbox.width) && isNumber(bbox.height) &&
          e.width + e.x < bbox.width + bbox.x &&
          e.height + e.y < bbox.height + bbox.y) {

        filteredElements[element.id] = element;
      } else if (!isNumber(bbox.width) || !isNumber(bbox.height)) {
        filteredElements[element.id] = element;
      }
    }
  });

  return filteredElements;
}

/**
 * Get the element's type
 *
 * @param {Element} element
 *
 * @return {'connection' | 'shape' | 'root'}
 */
export function getType(element) {

  if ('waypoints' in element) {
    return 'connection';
  }

  if ('x' in element) {
    return 'shape';
  }

  return 'root';
}

/**
 * @param {Element} element
 *
 * @return {boolean}
 */
export function isFrameElement(element) {
  return !!(element && element.isFrame);
}

// helpers ///////////////////////////////

function copyObject(src1, src2) {
  return assign({}, src1 || {}, src2 || {});
}
