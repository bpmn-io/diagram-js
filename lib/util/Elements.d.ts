/**
 * Get parent elements.
 *
 * @param elements
 *
 * @return
 */
export function getParents(elements: Element[]): Element[];

/**
 * Adds an element to a collection and returns true if the
 * element was added.
 *
 * @param elements
 * @param element
 * @param unique
 */
export function add(elements: any[], element: any, unique?: boolean): boolean;

/**
 * Iterate over each element in a collection, calling the iterator function `fn`
 * with (element, index, recursionDepth).
 *
 * Recurse into all elements that are returned by `fn`.
 *
 * @param elements
 * @param fn
 * @param depth maximum recursion depth
 */
export function eachElement(elements: Element | Element[], fn: (element: Element, index: number, depth: number) => Element[] | boolean | undefined, depth?: number): void;

/**
 * Collects self + child elements up to a given depth from a list of elements.
 *
 * @param elements the elements to select the children from
 * @param unique whether to return a unique result set (no duplicates)
 * @param maxDepth the depth to search through or -1 for infinite
 *
 * @return found elements
 */
export function selfAndChildren(elements: Element | Element[], unique: boolean, maxDepth: number): Element[];

/**
 * Return self + direct children for a number of elements
 *
 * @param elements to query
 * @param allowDuplicates to allow duplicates in the result set
 *
 * @return the collected elements
 */
export function selfAndDirectChildren(elements: Element[], allowDuplicates?: boolean): Element[];

/**
 * Return self + ALL children for a number of elements
 *
 * @param elements to query
 * @param allowDuplicates to allow duplicates in the result set
 *
 * @return the collected elements
 */
export function selfAndAllChildren(elements: Element[], allowDuplicates?: boolean): Element[];

/**
 * Gets the the closure for all selected elements,
 * their enclosed children and connections.
 *
 * @param elements
 * @param isTopLevel
 * @param closure
 *
 * @return newClosure
 */
export function getClosure(elements: Element[], isTopLevel?: boolean, closure?: Closure): Closure;

/**
 * Returns the surrounding bbox for all elements in
 * the array or the element primitive.
 *
 * @param elements
 * @param stopRecursion
 *
 * @return
 */
export function getBBox(elements: Element | Element[], stopRecursion?: boolean): Rect;

/**
 * Returns all elements that are enclosed from the bounding box.
 *
 *   * If bbox.(width|height) is not specified the method returns
 *     all elements with element.x/y > bbox.x/y
 *   * If only bbox.x or bbox.y is specified, method return all elements with
 *     e.x > bbox.x or e.y > bbox.y
 *
 * @param elements List of Elements to search through
 * @param bbox the enclosing bbox.
 *
 * @return enclosed elements
 */
export function getEnclosedElements(elements: Element[], bbox: Rect): Element[];

/**
 * Get the element's type
 *
 * @param element
 *
 * @return
 */
export function getType(element: Element): 'connection' | 'shape' | 'root';

/**
 * @param element
 *
 * @return
 */
export function isFrameElement(element: Element): boolean;

type Connection = import('../model/Types').Connection;
type Element = import('../model/Types').Element;
type Shape = import('../model/Types').Shape;
type Rect = import('../util/Types').Rect;

export type Closure = {
    allShapes: Record<string, Shape>;
    allConnections: Record<string, Connection>;
    topLevel: Record<string, Element>;
    enclosedConnections: Record<string, Connection>;
    enclosedElements: Record<string, Element>;
};
