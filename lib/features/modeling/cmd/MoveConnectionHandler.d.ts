/**
 * A handler that implements reversible moving of connections.
 *
 * The handler differs from the layout connection handler in a sense
 * that it preserves the connection layout.
 */
export default class MoveConnectionHandler {
    execute(context: any): any;
    revert(context: any): any;
}
