import {
  forEach
} from 'min-dash';

import {
  delegate as domDelegate,
  query as domQuery
} from 'min-dom';

import { isPrimaryButton } from '../../util/Mouse';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import {
  createLine,
  updateLine
} from '../../util/RenderUtil';

function allowAll(e) { return true; }

var LOW_PRIORITY = 500;

/**
 * A plugin that provides interaction events for diagram elements.
 *
 * It emits the following events:
 *
 *   * element.hover
 *   * element.out
 *   * element.click
 *   * element.dblclick
 *   * element.mousedown
 *   * element.contextmenu
 *
 * Each event is a tuple { element, gfx, originalEvent }.
 *
 * Canceling the event via Event#preventDefault()
 * prevents the original DOM operation.
 *
 * @param {EventBus} eventBus
 */
export default function InteractionEvents(eventBus, elementRegistry, styles) {

  var HIT_STYLE = styles.cls('djs-hit', [ 'no-fill', 'no-border' ], {
    stroke: 'white',
    strokeWidth: 15
  });

  /**
   * Fire an interaction event.
   *
   * @param {String} type local event name, e.g. element.click.
   * @param {DOMEvent} event native event
   * @param {djs.model.Base} [element] the diagram element to emit the event on;
   *                                   defaults to the event target
   */
  function fire(type, event, element) {

    if (isIgnored(type, event)) {
      return;
    }

    var target, gfx, returnValue;

    if (!element) {
      target = event.delegateTarget || event.target;

      if (target) {
        gfx = target;
        element = elementRegistry.get(gfx);
      }
    } else {
      gfx = elementRegistry.getGraphics(element);
    }

    if (!gfx || !element) {
      return;
    }

    returnValue = eventBus.fire(type, {
      element: element,
      gfx: gfx,
      originalEvent: event
    });

    if (returnValue === false) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  // TODO(nikku): document this
  var handlers = {};

  function mouseHandler(localEventName) {
    return handlers[localEventName];
  }

  function isIgnored(localEventName, event) {

    var filter = ignoredFilters[localEventName] || isPrimaryButton;

    // only react on left mouse button interactions
    // except for interaction events that are enabled
    // for secundary mouse button
    return !filter(event);
  }

  var bindings = {
    mouseover: 'element.hover',
    mouseout: 'element.out',
    click: 'element.click',
    dblclick: 'element.dblclick',
    mousedown: 'element.mousedown',
    mouseup: 'element.mouseup',
    contextmenu: 'element.contextmenu'
  };

  var ignoredFilters = {
    'element.contextmenu': allowAll
  };


  // manual event trigger

  /**
   * Trigger an interaction event (based on a native dom event)
   * on the target shape or connection.
   *
   * @param {String} eventName the name of the triggered DOM event
   * @param {MouseEvent} event
   * @param {djs.model.Base} targetElement
   */
  function triggerMouseEvent(eventName, event, targetElement) {

    // i.e. element.mousedown...
    var localEventName = bindings[eventName];

    if (!localEventName) {
      throw new Error('unmapped DOM event name <' + eventName + '>');
    }

    return fire(localEventName, event, targetElement);
  }


  var elementSelector = 'svg, .djs-element';

  // event registration

  function registerEvent(node, event, localEvent, ignoredFilter) {

    var handler = handlers[localEvent] = function(event) {
      fire(localEvent, event);
    };

    if (ignoredFilter) {
      ignoredFilters[localEvent] = ignoredFilter;
    }

    handler.$delegate = domDelegate.bind(node, elementSelector, event, handler);
  }

  function unregisterEvent(node, event, localEvent) {

    var handler = mouseHandler(localEvent);

    if (!handler) {
      return;
    }

    domDelegate.unbind(node, event, handler.$delegate);
  }

  function registerEvents(svg) {
    forEach(bindings, function(val, key) {
      registerEvent(svg, key, val);
    });
  }

  function unregisterEvents(svg) {
    forEach(bindings, function(val, key) {
      unregisterEvent(svg, key, val);
    });
  }

  eventBus.on('canvas.destroy', function(event) {
    unregisterEvents(event.svg);
  });

  eventBus.on('canvas.init', function(event) {
    registerEvents(event.svg);
  });


  eventBus.on([ 'shape.added', 'connection.added' ], function(event) {
    var element = event.element,
        gfx = event.gfx,
        hit;

    if (element.waypoints) {
      hit = createLine(element.waypoints);
    } else {
      hit = svgCreate('rect');
      svgAttr(hit, {
        x: 0,
        y: 0,
        width: element.width,
        height: element.height
      });
    }

    svgAttr(hit, HIT_STYLE);

    svgAppend(gfx, hit);
  });

  // Update djs-hit on change.
  // A low priortity is necessary, because djs-hit of labels has to be updated
  // after the label bounds have been updated in the renderer.
  eventBus.on('shape.changed', LOW_PRIORITY, function(event) {

    var element = event.element,
        gfx = event.gfx,
        hit = domQuery('.djs-hit', gfx);

    svgAttr(hit, {
      width: element.width,
      height: element.height
    });
  });

  eventBus.on('connection.changed', function(event) {

    var element = event.element,
        gfx = event.gfx,
        hit = domQuery('.djs-hit', gfx);

    updateLine(hit, element.waypoints);
  });


  // API

  this.fire = fire;

  this.triggerMouseEvent = triggerMouseEvent;

  this.mouseHandler = mouseHandler;

  this.registerEvent = registerEvent;
  this.unregisterEvent = unregisterEvent;
}


InteractionEvents.$inject = [
  'eventBus',
  'elementRegistry',
  'styles'
];


/**
 * An event indicating that the mouse hovered over an element
 *
 * @event element.hover
 *
 * @type {Object}
 * @property {djs.model.Base} element
 * @property {SVGElement} gfx
 * @property {Event} originalEvent
 */

/**
 * An event indicating that the mouse has left an element
 *
 * @event element.out
 *
 * @type {Object}
 * @property {djs.model.Base} element
 * @property {SVGElement} gfx
 * @property {Event} originalEvent
 */

/**
 * An event indicating that the mouse has clicked an element
 *
 * @event element.click
 *
 * @type {Object}
 * @property {djs.model.Base} element
 * @property {SVGElement} gfx
 * @property {Event} originalEvent
 */

/**
 * An event indicating that the mouse has double clicked an element
 *
 * @event element.dblclick
 *
 * @type {Object}
 * @property {djs.model.Base} element
 * @property {SVGElement} gfx
 * @property {Event} originalEvent
 */

/**
 * An event indicating that the mouse has gone down on an element.
 *
 * @event element.mousedown
 *
 * @type {Object}
 * @property {djs.model.Base} element
 * @property {SVGElement} gfx
 * @property {Event} originalEvent
 */

/**
 * An event indicating that the mouse has gone up on an element.
 *
 * @event element.mouseup
 *
 * @type {Object}
 * @property {djs.model.Base} element
 * @property {SVGElement} gfx
 * @property {Event} originalEvent
 */

/**
 * An event indicating that the context menu action is triggered
 * via mouse or touch controls.
 *
 * @event element.contextmenu
 *
 * @type {Object}
 * @property {djs.model.Base} element
 * @property {SVGElement} gfx
 * @property {Event} originalEvent
 */