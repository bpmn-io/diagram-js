/**
 * Get free position starting from given position.
 *
 * @param source
 * @param element
 * @param position
 * @param getNextPosition
 *
 * @return
 */
export function findFreePosition(source: Shape, element: Shape, position: Point, getNextPosition: (element: Element, position: Point, connectedAtPosition: Element) => Point): Point;

/**
 * Returns function that returns next position.
 *
 * @param nextPositionDirection
 *
 * @return
 */
export function generateGetNextPosition(nextPositionDirection: {
    x?: any;
    y?: any;
}): (element: Element, previousPosition: Point, connectedAtPosition: Element) => Point;

/**
 * Return connected element at given position and within given bounds. Takes
 * connected elements from host and attachers into account, too.
 *
 * @param source
 * @param position
 * @param element
 *
 * @return
 */
export function getConnectedAtPosition(source: Shape, position: Point, element: Shape): Shape | undefined;

/**
* Compute optimal distance between source and target based on existing connections to and from source.
* Assumes left-to-right and top-to-down modeling.
*
* @param source
* @param hintsreturn
*/
export function getConnectedDistance(source: Shape, hints?: {
    defaultDistance?: number;
    direction?: string;
    filter?: (connection: Connection) => boolean;
    getWeight?: (connection: Connection) => number;
    maxDistance?: number;
    reference?: 'start' | 'center' | 'end';
}): number;

export const DEFAULT_DISTANCE: number;
type Connection = import('../../model/Types').Connection;
type Element = import('../../model/Types').Element;
type Shape = import('../../model/Types').Shape;
type Point = import('../../util/Types').Point;
