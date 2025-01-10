/**
 * @param connection
 * @param shape
 * @param oldBounds
 * @return
 */
export function getResizedSourceAnchor(connection: Connection, shape: Shape, oldBounds: Rect): Point;

export function getResizedTargetAnchor(connection: any, shape: any, oldBounds: any): any;
export function getMovedSourceAnchor(connection: any, source: any, moveDelta: any): import("../../../../util/Types").Point;
export function getMovedTargetAnchor(connection: any, target: any, moveDelta: any): import("../../../../util/Types").Point;
type Connection = import('../../../../core/Types').ConnectionLike;
type Shape = import('../../../../core/Types').ShapeLike;
type Point = import('../../../../util/Types').Point;
type Rect = import('../../../../util/Types').Rect;
