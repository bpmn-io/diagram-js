import {
  isCmd,
  isShift
} from './helpers';


/**
 * Adds default KeyboardEvent listeners
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
export default function KeyboardBindings(keyboard, editorActions) {

  var config = keyboard._config;

  keyboard.addListener(copy);
  keyboard.addListener(paste);

  keyboard.addListener(undo);
  keyboard.addListener(redo);

  keyboard.addListener(removeSelection);

  keyboard.addListener(zoomDefault);
  keyboard.addListener(zoomIn);
  keyboard.addListener(zoomOut);

  keyboard.addListener(moveCanvas);


  // undo
  // (CTRL|CMD) + Z
  function undo(context) {

    var event = context.event;

    if (isCmd(event) && !isShift(event) && event.keyCode === 90) {
      editorActions.trigger('undo');

      return true;
    }
  }

  // redo
  // CTRL + Y
  // CMD + SHIFT + Z
  function redo(context) {

    var event = context.event,
        key = event.keyCode;

    if (isCmd(event) && (key === 89 || (key === 90 && isShift(event)))) {
      editorActions.trigger('redo');

      return true;
    }
  }

  // copy
  // CTRL/CMD + C
  function copy(context) {

    var event = context.event;

    if (isCmd(event) && (event.keyCode === 67)) {
      editorActions.trigger('copy');

      return true;
    }
  }

  // paste
  // CTRL/CMD + V
  function paste(context) {

    var event = context.event;

    if (isCmd(event) && (event.keyCode === 86)) {
      editorActions.trigger('paste');

      return true;
    }
  }

  /**
   * zoom in one step
   * CTRL + +
   *
   * 107 = numpad plus
   * 187 = regular plus
   * 171 = regular plus in Firefox (german keyboard layout)
   *  61 = regular plus in Firefox (US keyboard layout)
   */
  function zoomIn(context) {

    var event = context.event,
        key = event.keyCode;

    if ((key === 107 || key === 187 || key === 171 || key === 61) && isCmd(event)) {
      editorActions.trigger('stepZoom', { value: 1 });

      return true;
    }
  }

  /**
   * zoom out one step
   * CTRL + -
   *
   * 109 = numpad minus
   * 189 = regular minus
   * 173 = regular minus in Firefox (US and german keyboard layout)
   */
  function zoomOut(context) {

    var event = context.event,
        key = event.keyCode;

    if ((key === 109 || key === 189 || key === 173) && isCmd(event)) {
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

    var event = context.event,
        key = event.keyCode;

    if ((key === 96 || key === 48) && isCmd(event)) {
      editorActions.trigger('zoom', { value: 1 });

      return true;
    }
  }

  // delete selected element
  // DEL
  function removeSelection(context) {

    var event = context.event;

    if (event.keyCode === 46) {
      editorActions.trigger('removeSelection');

      return true;
    }
  }

  // move canvas left
  // left arrow
  //
  // 37 = Left
  // 38 = Up
  // 39 = Right
  // 40 = Down
  function moveCanvas(context) {

    var event = context.event,
        key = event.keyCode;

    if ([37, 38, 39, 40].indexOf(key) >= 0) {

      var opts = {
        invertY: config.invertY,
        speed: (config.speed || 50)
      };

      switch (key) {
      case 37: // Left
        opts.direction = 'left';
        break;
      case 38: // Up
        opts.direction = 'up';
        break;
      case 39: // Right
        opts.direction = 'right';
        break;
      case 40: // Down
        opts.direction = 'down';
        break;
      }

      editorActions.trigger('moveCanvas', opts);

      return true;
    }
  }
}

KeyboardBindings.$inject = [
  'keyboard',
  'editorActions'
];