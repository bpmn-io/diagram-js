import {
  getOriginal as getOriginalEvent
} from './Event';

import {
  isMac
} from './Platform';

export {
  isMac
} from './Platform';

/**
 * @param {MouseEvent} event
 * @param {string} button
 *
 * @return {boolean}
 */
export function isButton(event, button) {
  return (getOriginalEvent(event) || event).button === button;
}

/**
 * @param {MouseEvent} event
 *
 * @return {boolean}
 */
export function isPrimaryButton(event) {

  // button === 0 -> left áka primary mouse button
  return isButton(event, 0);
}

/**
 * @param {MouseEvent} event
 *
 * @return {boolean}
 */
export function isAuxiliaryButton(event) {

  // button === 1 -> auxiliary áka wheel button
  return isButton(event, 1);
}

/**
 * @param {MouseEvent} event
 *
 * @return {boolean}
 */
export function isSecondaryButton(event) {

  // button === 2 -> right áka secondary button
  return isButton(event, 2);
}

/**
 * @param {MouseEvent} event
 *
 * @return {boolean}
 */
export function hasPrimaryModifier(event) {
  var originalEvent = getOriginalEvent(event) || event;

  if (!isPrimaryButton(event)) {
    return false;
  }

  // Use cmd as primary modifier key for mac OS
  if (isMac()) {
    return originalEvent.metaKey;
  } else {
    return originalEvent.ctrlKey;
  }
}

/**
 * @param {MouseEvent} event
 *
 * @return {boolean}
 */
export function hasSecondaryModifier(event) {
  var originalEvent = getOriginalEvent(event) || event;

  return isPrimaryButton(event) && originalEvent.shiftKey;
}
