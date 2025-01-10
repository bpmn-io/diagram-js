/**
 * A component that handles language switching in a unified way.
 *
 */
export default class I18N {
    static $inject: string[];
    /**
     * @param eventBus
     */
    constructor(eventBus: EventBus);
    /**
     * Inform components that the language changed.
     *
     * Emit a `i18n.changed` event for others to hook into, too.
     */
    changed: () => void;
}

type EventBus = import('../core/EventBus').default;
