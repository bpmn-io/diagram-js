/**
 * @param elements
 *
 * @return
 */
export function componentsToPath(elements: Component[] | Component[][]): string;

/**
 * @param points
 *
 * @return
 */
export function toSVGPoints(points: Point[]): string;

/**
 * @param points
 * @param attrs
 * @param radius
 *
 * @return
 */
export function createLine(points: Point[], attrs?: number | any, radius?: number): SVGElement;

/**
 * @param gfx
 * @param points
 *
 * @return
 */
export function updateLine(gfx: SVGElement, points: Point[]): SVGElement;

export type Component = (string | number)[];
type Point = import('../util/Types').Point;
