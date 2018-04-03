var TRAP_PRIORITY = 5000;

/**
 * Installs a click trap that prevents a ghost click following a dragging operation.
 *
 * @return {Function} a function to immediately remove the installed trap.
 */
export function install(eventBus, eventName) {

  eventName = eventName || 'element.click';

  function trap() {
    return false;
  }

  eventBus.once(eventName, TRAP_PRIORITY, trap);

  return function() {
    eventBus.off(eventName, trap);
  };
}