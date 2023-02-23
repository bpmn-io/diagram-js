/**
 * @typedef {import('../../../core/EventBus').default} EventBus
 * @typedef {import('../../grid-snapping/GridSnapping').default} GridSnapping
 */

var HIGH_PRIORITY = 2000;

/**
 * Integrates space tool with grid snapping.
 *
 * @param {EventBus} eventBus
 * @param {GridSnapping} gridSnapping
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

    var snapped;

    if (axis === 'x') {

      // snap delta x to multiple of 10
      snapped = gridSnapping.snapValue(event.dx);

      event.x = event.x + snapped - event.dx;
      event.dx = snapped;
    } else {

      // snap delta y to multiple of 10
      snapped = gridSnapping.snapValue(event.dy);

      event.y = event.y + snapped - event.dy;
      event.dy = snapped;
    }
  });
}

SpaceToolBehavior.$inject = [
  'eventBus',
  'gridSnapping'
];