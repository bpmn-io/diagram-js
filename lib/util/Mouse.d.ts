/**
 * @param event
 * @param button
 *
 * @return
 */
export function isButton(event: MouseEvent, button: string): boolean;
/**
 * @param event
 *
 * @return
 */
export function isPrimaryButton(event: MouseEvent): boolean;
/**
 * @param event
 *
 * @return
 */
export function isAuxiliaryButton(event: MouseEvent): boolean;
/**
 * @param event
 *
 * @return
 */
export function isSecondaryButton(event: MouseEvent): boolean;
/**
 * @param event
 *
 * @return
 */
export function hasPrimaryModifier(event: MouseEvent): boolean;
/**
 * @param event
 *
 * @return
 */
export function hasSecondaryModifier(event: MouseEvent): boolean;
export { isMac } from "./Platform";
