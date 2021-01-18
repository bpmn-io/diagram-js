import {
  getOriginal as getOriginalEvent
} from './Event';

import {
  isMac
} from './Platform';

export {
  isMac
} from './Platform';

export function isButton(event, button) {
  return (getOriginalEvent(event) || event).button === button;
}

export function isPrimaryButton(event) {

  // button === 0 -> left áka primary mouse button
  return isButton(event, 0);
}

export function isAuxiliaryButton(event) {

  // button === 1 -> auxiliary áka wheel button
  return isButton(event, 1);
}

export function isSecondaryButton(event) {

  // button === 2 -> right áka secondary button
  return isButton(event, 2);
}

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


export function hasSecondaryModifier(event) {
  var originalEvent = getOriginalEvent(event) || event;

  return isPrimaryButton(event) && originalEvent.shiftKey;
}
