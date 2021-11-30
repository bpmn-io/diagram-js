import inherits from 'inherits';

import CommandInterceptor from '../../command/CommandInterceptor';

export default function PlanesBehavior(canvas, injector) {

  injector.invoke(CommandInterceptor, this);

  this.executed(function(event) {
    var context = event.context;

    if (context.plane) {
      canvas.setActivePlane(context.plane);
    } else {
      context.plane = canvas.getActivePlane().name;
    }
  });

  this.revert(function(event) {
    var context = event.context;

    if (context.plane) {
      canvas.setActivePlane(context.plane);
    }
  });
}

inherits(PlanesBehavior, CommandInterceptor);

PlanesBehavior.$inject = [ 'canvas', 'injector'];