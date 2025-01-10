/**
 * @param bounds
 * @return
 */
export function center(bounds: Rect): Point;

/**
 * @param a
 * @param b
 * @return
 */
export function delta(a: Point, b: Point): Point;

type Point = import('../util/Types').Point;
type Rect = import('../util/Types').Rect;
