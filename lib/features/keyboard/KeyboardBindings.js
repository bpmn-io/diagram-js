import {
  isCmd,
  isKey,
  isShift
} from './KeyboardUtil';


/**
 * Adds default KeyboardEvent listeners
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
export default function KeyboardBindings(keyboard, editorActions) {

  // undo
  // (CTRL|CMD) + Z
  function undo(context) {

    var event = context.event;

    if (isCmd(event) && !isShift(event) && isKey(['z', 'Z'], event)) {
      editorActions.trigger('undo');

      return true;
    }
  }

  // redo
  // CTRL + Y
  // CMD + SHIFT + Z
  function redo(context) {

    var event = context.event;

    if (isCmd(event) && (isKey(['y', 'Y'], event) || (isKey(['z', 'Z'], event) && isShift(event)))) {
      editorActions.trigger('redo');

      return true;
    }
  }

  // copy
  // CTRL/CMD + C
  function copy(context) {

    var event = context.event;

    if (isCmd(event) && isKey(['c', 'C'], event)) {
      editorActions.trigger('copy');

      return true;
    }
  }

  // paste
  // CTRL/CMD + V
  function paste(context) {

    var event = context.event;

    if (isCmd(event) && isKey(['v', 'V'], event)) {
      editorActions.trigger('paste');

      return true;
    }
  }

  /**
   * zoom in one step
   * CTRL + +
   *
   * `=` is included because of possible combination with SHIFT
   */
  function zoomIn(context) {

    var event = context.event;

    if (isKey([ '+', 'Add', '=' ], event) && isCmd(event)) {
      editorActions.trigger('stepZoom', { value: 1 });

      return true;
    }
  }

  /**
   * zoom out one step
   * CTRL + -
   *
   * `_` is included because of possible combination with SHIFT
   */
  function zoomOut(context) {

    var event = context.event;

    if (isKey([ '-', '_', 'Subtract' ], event) && isCmd(event)) {
      editorActions.trigger('stepZoom', { value: -1 });

      return true;
    }
  }

  /**
   * zoom to the default level
   * CTRL + 0
   *
   * 96 = numpad zero
   * 48 = regular zero
   */
  function zoomDefault(context) {

    var event = context.event;

    if (isKey('0', event) && isCmd(event)) {
      editorActions.trigger('zoom', { value: 1 });

      return true;
    }
  }

  // delete selected element
  // DEL
  function removeSelection(context) {

    var event = context.event;

    if (isKey('Delete', event)) {
      editorActions.trigger('removeSelection');

      return true;
    }
  }


  keyboard.addListener(copy);
  keyboard.addListener(paste);

  keyboard.addListener(undo);
  keyboard.addListener(redo);

  keyboard.addListener(removeSelection);

  keyboard.addListener(zoomDefault);
  keyboard.addListener(zoomIn);
  keyboard.addListener(zoomOut);
}

KeyboardBindings.$inject = [
  'keyboard',
  'editorActions'
];