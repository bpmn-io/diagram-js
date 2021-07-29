import inherits from 'inherits';

import CommandInterceptor from '../../command/CommandInterceptor';

export default function PlanesBehaviour(canvas, eventBus, injector,) {

  injector.invoke(CommandInterceptor, this);

  this.executed(function(event) {
    var context = event.context;

    if (context.plane) {
      canvas.setPlane(context.plane);
    } else {
      context.plane = canvas.getActivePlane();
    }
  });

  this.revert(function(event) {
    var context = event.context;

    if (context.plane) {
      canvas.setPlane(context.plane);
    }
  });
}

inherits(PlanesBehaviour, CommandInterceptor);

PlanesBehaviour.$inject = [ 'canvas', 'eventBus', 'injector'];