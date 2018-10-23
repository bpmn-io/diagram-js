import {
  assign,
  isString
} from 'min-dash';

export function createKeyEvent(key, modifiers, target) {

  var event = document.createEvent('Events') || new document.defaultView.CustomEvent('keyEvent');

  var options = modifiers || {};

  if (isString(key)) {
    options.key = key;
  }

  options.keyCode = key;
  options.which = key;
  options.target = target || document;
  options.preventDefault = preventDefault;

  return assign({}, event, options);
}

// helpers //////

function preventDefault() {
  this.defaultPrevented = true;
}