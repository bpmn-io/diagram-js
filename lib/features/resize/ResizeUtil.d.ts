/**
 * Substract a TRBL from another
 *
 * @param trblA
 * @param trblB
 *
 * @return
 */
export function substractTRBL(trblA: RectTRBL, trblB: RectTRBL): RectTRBL;

/**
 * Resize the given bounds by the specified delta from a given anchor point.
 *
 * @param bounds the bounding box that should be resized
 * @param direction in which the element is resized (nw, ne, se, sw)
 * @param delta of the resize operation
 *
 * @return resized bounding box
 */
export function resizeBounds(bounds: Rect, direction: Direction, delta: Point): Rect;

/**
 * Resize the given bounds by applying the passed
 * { top, right, bottom, left } delta.
 *
 * @param bounds
 * @param resize
 *
 * @return
 */
export function resizeTRBL(bounds: Rect, resize: RectTRBL): Rect;

export function reattachPoint(bounds: any, newBounds: any, point: any): {
    x: number;
    y: number;
};

export function ensureConstraints(currentBounds: any, resizeConstraints: any): any;
export function getMinResizeBounds(direction: any, currentBounds: any, minDimensions: any, childrenBounds: any): import("../../util/Types").Rect;

export function addPadding(bbox: any, padding: any): {
    x: number;
    y: number;
    width: any;
    height: any;
};

/**
 * Return children bounding computed from a shapes children
 * or a list of prefiltered children.
 *
 * @param shapeOrChildren
 * @param padding
 *
 * @return
 */
export function computeChildrenBBox(shapeOrChildren: Shape | Shape[], padding: RectTRBL | number): Rect;

type Element = import('../../core/Types').ElementLike;
type Shape = import('../../core/Types').ShapeLike;
type Direction = import('../../util/Types').Direction;
type Point = import('../../util/Types').Point;
type Rect = import('../../util/Types').Rect;
type RectTRBL = import('../../util/Types').RectTRBL;
