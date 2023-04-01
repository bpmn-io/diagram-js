import {
  getMid
} from '../../layout/LayoutUtil';

import {
  isNil,
  isObject
} from 'min-dash';

/**
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef {import('../../util/Types').Point} Point
 *
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../rules/Rules').default} Rules
 */

/**
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {Modeling} modeling
 * @param {Rules} rules
 */
export default function Connect(eventBus, dragging, modeling, rules) {

  // rules

  function canConnect(source, target) {
    return rules.allowed('connection.create', {
      source: source,
      target: target
    });
  }

  function canConnectReverse(source, target) {
    return canConnect(target, source);
  }


  // event handlers

  eventBus.on('connect.hover', function(event) {
    var context = event.context,
        start = context.start,
        hover = event.hover,
        canExecute;

    // cache hover state
    context.hover = hover;

    canExecute = context.canExecute = canConnect(start, hover);

    // ignore hover
    if (isNil(canExecute)) {
      return;
    }

    if (canExecute !== false) {
      context.source = start;
      context.target = hover;

      return;
    }

    canExecute = context.canExecute = canConnectReverse(start, hover);

    // ignore hover
    if (isNil(canExecute)) {
      return;
    }

    if (canExecute !== false) {
      context.source = hover;
      context.target = start;
    }
  });

  eventBus.on([ 'connect.out', 'connect.cleanup' ], function(event) {
    var context = event.context;

    context.hover = null;
    context.source = null;
    context.target = null;

    context.canExecute = false;
  });

  eventBus.on('connect.end', function(event) {
    var context = event.context,
        canExecute = context.canExecute,
        connectionStart = context.connectionStart,
        connectionEnd = {
          x: event.x,
          y: event.y
        },
        source = context.source,
        target = context.target;

    if (!canExecute) {
      return false;
    }

    var attrs = null,
        hints = {
          connectionStart: isReverse(context) ? connectionEnd : connectionStart,
          connectionEnd: isReverse(context) ? connectionStart : connectionEnd
        };

    if (isObject(canExecute)) {
      attrs = canExecute;
    }

    context.connection = modeling.connect(source, target, attrs, hints);
  });


  // API

  /**
   * Start connect operation.
   *
   * @param {MouseEvent|TouchEvent} event
   * @param {Element} start
   * @param {Point} [connectionStart]
   * @param {boolean} [autoActivate=false]
   */
  this.start = function(event, start, connectionStart, autoActivate) {
    if (!isObject(connectionStart)) {
      autoActivate = connectionStart;
      connectionStart = getMid(start);
    }

    dragging.init(event, 'connect', {
      autoActivate: autoActivate,
      data: {
        shape: start,
        context: {
          start: start,
          connectionStart: connectionStart
        }
      }
    });
  };
}

Connect.$inject = [
  'eventBus',
  'dragging',
  'modeling',
  'rules'
];


// helpers //////////

export function isReverse(context) {
  var hover = context.hover,
      source = context.source,
      target = context.target;

  return hover && source && hover === source && source !== target;
}