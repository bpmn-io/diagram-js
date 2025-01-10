/**
 * Adds default keyboard bindings.
 *
 * This does not pull in any features will bind only actions that
 * have previously been registered against the editorActions component.
 *
 */
export default class KeyboardBindings {
    static $inject: string[];
    /**
     * @param eventBus
     * @param keyboard
     */
    constructor(eventBus: EventBus, keyboard: Keyboard);
    /**
     * Register available keyboard bindings.
     *
     * @param keyboard
     * @param editorActions
     */
    registerBindings(keyboard: Keyboard, editorActions: EditorActions): void;
}

type EditorActions = import('../editor-actions/EditorActions').default;
type EventBus = import('../../core/EventBus').default;
type Keyboard = import('./Keyboard').default;
import { KEYS_COPY } from './KeyboardUtil';
import { KEYS_PASTE } from './KeyboardUtil';
import { KEYS_UNDO } from './KeyboardUtil';
import { KEYS_REDO } from './KeyboardUtil';
export { KEYS_COPY, KEYS_PASTE, KEYS_UNDO, KEYS_REDO };
