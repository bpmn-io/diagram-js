/**
 * Snap value to a collection of reference values.
 *
 * @param value
 * @param values
 * @param tolerance
 *
 * @return the value we snapped to or null, if none snapped
 */
export function snapTo(value: number, values: Array<number>, tolerance?: number): number;

export function topLeft(bounds: any): {
    x: any;
    y: any;
};

export function topRight(bounds: any): {
    x: any;
    y: any;
};

export function bottomLeft(bounds: any): {
    x: any;
    y: any;
};

export function bottomRight(bounds: any): {
    x: any;
    y: any;
};

export function mid(bounds: any, defaultValue: any): any;

/**
 * Retrieve the snap state of the given event.
 *
 * @param event
 * @param axis
 *
 * @return the snapped state
 *
 */
export function isSnapped(event: Event, axis: Axis): boolean;

/**
 * Set the given event as snapped.
 *
 * This method may change the x and/or y position of the shape
 * from the given event!
 *
 * @param event
 * @param axis
 * @param value
 *
 * @return old value
 */
export function setSnapped(event: Event, axis: Axis, value: number | boolean): number;

/**
 * Get children of a shape.
 *
 * @param parent
 *
 * @return
 */
export function getChildren(parent: Shape): Array<Shape | Connection>;

type Connection = import('../../core/Types').ConnectionLike;
type Shape = import('../../core/Types').ShapeLike;
type Event = import('../../core/EventBus').Event;
type Axis = import('../../util/Types').Axis;
