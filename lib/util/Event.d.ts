/**
 * @param event
 *
 * @return
 */
export function getOriginal(event: import('../core/EventBus').Event): Event;

/**
 * @param event
 */
export function stopPropagation(event: Event | import('../core/EventBus').Event): void;

/**
 * @param event
 *
 * @return
 */
export function toPoint(event: Event): Point | null;

type Point = import('../util/Types').Point;
