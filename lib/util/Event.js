/**
 * @typedef {import('../util/Types.js').Point} Point
 *
 * @typedef {import('../core/EventBus.js').Event} EventBusEvent
 */

function __stopPropagation(event) {
  if (!event || typeof event.stopPropagation !== 'function') {
    return;
  }

  event.stopPropagation();
}

/**
 * @param {EventBusEvent} event
 *
 * @return {Event}
 */
export function getOriginal(event) {
  return event.originalEvent || event.srcEvent;
}

/**
 * @param {Event|EventBusEvent} event
 */
export function stopPropagation(event) {
  __stopPropagation(event);
  __stopPropagation(getOriginal(event));
}

/**
 * @param {Event} event
 *
 * @return {Point|null}
 */
export function toPoint(event) {

  if (event.pointers && event.pointers.length) {
    event = event.pointers[0];
  }

  if (event.touches && event.touches.length) {
    event = event.touches[0];
  }

  return event ? {
    x: event.clientX,
    y: event.clientY
  } : null;
}