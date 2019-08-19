import {
  getOriginal as getOriginalEvent
} from './Event';

import {
  isMac
} from './Platform';

export {
  isMac
} from './Platform';


export function isPrimaryButton(event) {

  // button === 0 -> left áka primary mouse button
  return !(getOriginalEvent(event) || event).button;
}

export function hasPrimaryModifier(event) {
  var originalEvent = getOriginalEvent(event) || event;

  if (!isPrimaryButton(event)) {
    return false;
  }

  // Use alt as primary modifier key for mac OS
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