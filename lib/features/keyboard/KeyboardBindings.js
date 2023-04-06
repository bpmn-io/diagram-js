import {
  isCmd,
  isKey,
  isCopy,
  isPaste,
  isUndo,
  isRedo,
  KEYS_COPY,
  KEYS_PASTE,
  KEYS_UNDO,
  KEYS_REDO
} from './KeyboardUtil';

/**
 * @typedef {import('../editor-actions/EditorActions').default} EditorActions
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('./Keyboard').default} Keyboard
 */

export {
  KEYS_COPY,
  KEYS_PASTE,
  KEYS_UNDO,
  KEYS_REDO
};


var LOW_PRIORITY = 500;


/**
 * Adds default keyboard bindings.
 *
 * This does not pull in any features will bind only actions that
 * have previously been registered against the editorActions component.
 *
 * @param {EventBus} eventBus
 * @param {Keyboard} keyboard
 */
export default function KeyboardBindings(eventBus, keyboard) {

  var self = this;

  eventBus.on('editorActions.init', LOW_PRIORITY, function(event) {

    var editorActions = event.editorActions;

    self.registerBindings(keyboard, editorActions);
  });
}

KeyboardBindings.$inject = [
  'eventBus',
  'keyboard'
];


/**
 * Register available keyboard bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
KeyboardBindings.prototype.registerBindings = function(keyboard, editorActions) {

  /**
   * Add keyboard binding if respective editor action
   * is registered.
   *
   * @param {string} action name
   * @param {Function} fn that implements the key binding
   */
  function addListener(action, fn) {

    if (editorActions.isRegistered(action)) {
      keyboard.addListener(fn);
    }
  }


  // undo
  // (CTRL|CMD) + Z
  addListener('undo', function(context) {

    var event = context.keyEvent;

    if (isUndo(event)) {
      editorActions.trigger('undo');

      return true;
    }
  });

  // redo
  // CTRL + Y
  // CMD + SHIFT + Z
  addListener('redo', function(context) {

    var event = context.keyEvent;

    if (isRedo(event)) {
      editorActions.trigger('redo');

      return true;
    }
  });

  // copy
  // CTRL/CMD + C
  addListener('copy', function(context) {

    var event = context.keyEvent;

    if (isCopy(event)) {
      editorActions.trigger('copy');

      return true;
    }
  });

  // paste
  // CTRL/CMD + V
  addListener('paste', function(context) {

    var event = context.keyEvent;

    if (isPaste(event)) {
      editorActions.trigger('paste');

      return true;
    }
  });

  // zoom in one step
  // CTRL/CMD + +
  addListener('stepZoom', function(context) {

    var event = context.keyEvent;

    // quirk: it has to be triggered by `=` as well to work on international keyboard layout
    // cf: https://github.com/bpmn-io/bpmn-js/issues/1362#issuecomment-722989754
    if (isKey([ '+', 'Add', '=' ], event) && isCmd(event)) {
      editorActions.trigger('stepZoom', { value: 1 });

      return true;
    }
  });

  // zoom out one step
  // CTRL + -
  addListener('stepZoom', function(context) {

    var event = context.keyEvent;

    if (isKey([ '-', 'Subtract' ], event) && isCmd(event)) {
      editorActions.trigger('stepZoom', { value: -1 });

      return true;
    }
  });

  // zoom to the default level
  // CTRL + 0
  addListener('zoom', function(context) {

    var event = context.keyEvent;

    if (isKey('0', event) && isCmd(event)) {
      editorActions.trigger('zoom', { value: 1 });

      return true;
    }
  });

  // delete selected element
  // DEL
  addListener('removeSelection', function(context) {

    var event = context.keyEvent;

    if (isKey([ 'Backspace', 'Delete', 'Del' ], event)) {
      editorActions.trigger('removeSelection');

      return true;
    }
  });
};