var LOW_PRIORITY = 740;

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../core/EventBus').default} EventBus
 */

/**
 * Shows connection preview during create.
 *
 * @param {Injector} injector
 * @param {EventBus} eventBus
 */
export default function CreateConnectPreview(injector, eventBus) {
  var connectionPreview = injector.get('connectionPreview', false);

  eventBus.on('create.move', LOW_PRIORITY, function(event) {
    var context = event.context,
        source = context.source,
        shape = context.shape,
        canExecute = context.canExecute,
        canConnect = canExecute && canExecute.connect;

    // don't draw connection preview if not appending a shape
    if (!connectionPreview || !source) {
      return;
    }

    // place shape's center on cursor
    shape.x = Math.round(event.x - shape.width / 2);
    shape.y = Math.round(event.y - shape.height / 2);

    connectionPreview.drawPreview(context, canConnect, {
      source: source,
      target: shape,
      waypoints: [],
      noNoop: true
    });
  });


  eventBus.on('create.cleanup', function(event) {
    if (connectionPreview) {
      connectionPreview.cleanUp(event.context);
    }
  });

}

CreateConnectPreview.$inject = [
  'injector',
  'eventBus'
];
