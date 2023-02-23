import inherits from 'inherits-browser';

import CommandInterceptor from '../../command/CommandInterceptor';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 */

/**
 * A modeling behavior that ensures we set the correct root element
 * as we undo and redo commands.
 *
 * @param {Canvas} canvas
 * @param {Injector} injector
 */
export default function RootElementsBehavior(canvas, injector) {

  injector.invoke(CommandInterceptor, this);

  this.executed(function(event) {
    var context = event.context;

    if (context.rootElement) {
      canvas.setRootElement(context.rootElement);
    } else {
      context.rootElement = canvas.getRootElement();
    }
  });

  this.revert(function(event) {
    var context = event.context;

    if (context.rootElement) {
      canvas.setRootElement(context.rootElement);
    }
  });
}

inherits(RootElementsBehavior, CommandInterceptor);

RootElementsBehavior.$inject = [ 'canvas', 'injector' ];