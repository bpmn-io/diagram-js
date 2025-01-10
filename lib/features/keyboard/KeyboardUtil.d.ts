/**
 * Returns true if event was triggered with any modifier
 * @param event
 */
export function hasModifier(event: KeyboardEvent): boolean;
/**
 * @param event
 * @return
 */
export function isCmd(event: KeyboardEvent): boolean;
/**
 * Checks if key pressed is one of provided keys.
 *
 * @param keys
 * @param event
 * @return
 */
export function isKey(keys: string | string[], event: KeyboardEvent): boolean;
/**
 * @param event
 */
export function isShift(event: KeyboardEvent): boolean;
/**
 * @param event
 */
export function isCopy(event: KeyboardEvent): boolean;
/**
 * @param event
 */
export function isPaste(event: KeyboardEvent): boolean;
/**
 * @param event
 */
export function isUndo(event: KeyboardEvent): boolean;
/**
 * @param event
 */
export function isRedo(event: KeyboardEvent): boolean;
export const KEYS_COPY: string[];
export const KEYS_PASTE: string[];
export const KEYS_REDO: string[];
export const KEYS_UNDO: string[];
