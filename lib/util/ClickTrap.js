/**
 * @typedef {import('../core/EventBus').EventBus} EventBus
 */

var TRAP_PRIORITY = 5000;

/**
 * Installs a click trap that prevents a ghost click following a dragging operation.
 *
 * @param {EventBus} eventBus
 * @param {string} [eventName='element.click']
 *
 * @return {() => void} a function to immediately remove the installed trap.
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