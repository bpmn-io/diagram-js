/**
 * Installs a click trap that prevents a ghost click following a dragging operation.
 *
 * @param eventBus
 * @param eventName
 *
 * @return a function to immediately remove the installed trap.
 */
export function install(eventBus: EventBus, eventName?: string): () => void;

type EventBus = import('../core/EventBus').default;
