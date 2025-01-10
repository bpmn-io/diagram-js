/**
 * A layout component for connections that retrieves waypoint information.
 *
 */
export default class ConnectionDocking {
    /**
     * Return the actual waypoints of the connection (visually).
     *
     * @param connection
     * @param source
     * @param target
     *
     * @return
     */
    getCroppedWaypoints(connection: any, source?: any, target?: any): Point[];
    /**
     * Return the connection docking point on the specified shape
     *
     * @param connection
     * @param shape
     * @param dockStart
     *
     * @return
     */
    getDockingPoint(connection: any, shape: any, dockStart?: boolean): DockingPointDescriptor;
}
export type Element = any;
export type Connection = any;
export type Shape = any;
export type Point = any;
export type DockingPointDescriptor = {
    point: any;
    actual: any;
    idx: number;
};
