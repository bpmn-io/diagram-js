import inherits from 'inherits';

import CommandInterceptor from '../../command/CommandInterceptor';


/**
 * A modeling behavior that ensures we change the planes
 * as we undo and redo commands.
 *
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {didi.Injector} injector
 */
export default function PlanesBehavior(canvas, eventBus, injector) {

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

inherits(PlanesBehavior, CommandInterceptor);

PlanesBehavior.$inject = [ 'canvas', 'eventBus', 'injector'];