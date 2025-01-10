/**
 * A base connection layouter implementation
 * that layouts the connection by directly connecting
 * mid(source) + mid(target).
 */
export default class BaseLayouter {
    /**
     * Return the new layouted waypoints for the given connection.
     *
     * The connection passed is still unchanged; you may figure out about
     * the new connection start / end via the layout hints provided.
     *
     * @param connection
     * @param hints
     *
     * @return The waypoints of the laid out connection.
     */
    layoutConnection(connection: Connection, hints?: LayoutConnectionHints): Point[];
}

type Element = import('../core/Types').ElementLike;
type Connection = import('../core/Types').ConnectionLike;
export type Point = any;

export type LayoutConnectionHints = {
    connectionStart?: Point;
    connectionEnd?: Point;
    source?: Element;
    target?: Element;
};
