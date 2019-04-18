var HIGH_PRIORITY = 2000;

/**
 * Integrates space tool with grid snapping.
 */
export default function SpaceToolBehavior(eventBus, gridSnapping) {
  eventBus.on([
    'spaceTool.move',
    'spaceTool.end'
  ], HIGH_PRIORITY, function(event) {
    var context = event.context;

    if (!context.initialized) {
      return;
    }

    var axis = context.axis;

    if (axis === 'x') {

      // snap delta x to multiple of 10
      event.dx = gridSnapping.snapValue(event.dx);
    } else {

      // snap delta y to multiple of 10
      event.dy = gridSnapping.snapValue(event.dy);
    }
  });
}

SpaceToolBehavior.$inject = [
  'eventBus',
  'gridSnapping'
];