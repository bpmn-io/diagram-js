function __stopPropagation(event) {
  if (!event || typeof event.stopPropagation !== 'function') {
    return;
  }

  event.stopPropagation();
}


export function getOriginal(event) {
  return event.originalEvent || event.srcEvent;
}


export function stopPropagation(event, immediate) {
  __stopPropagation(event, immediate);
  __stopPropagation(getOriginal(event), immediate);
}


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