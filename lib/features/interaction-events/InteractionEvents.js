import {
  forEach,
  assign
} from 'min-dash';

import {
  delegate as domDelegate,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { isPrimaryButton } from '../../util/Mouse';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
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
 *   * element.click
 *   * element.contextmenu
 *   * element.dblclick
 *   * element.hover
 *   * element.mousedown
 *   * element.mousemove
 *   * element.mouseup
 *   * element.out
 *
 * Each event is a tuple { element, gfx, originalEvent }.
 *
 * Canceling the event via Event#preventDefault()
 * prevents the original DOM operation.
 *
 * @param {EventBus} eventBus
 */
export default function InteractionEvents(eventBus, elementRegistry, styles) {

  var self = this;

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
    click: 'element.click',
    contextmenu: 'element.contextmenu',
    dblclick: 'element.dblclick',
    mousedown: 'element.mousedown',
    mousemove: 'element.mousemove',
    mouseover: 'element.hover',
    mouseout: 'element.out',
    mouseup: 'element.mouseup',
  };

  var ignoredFilters = {
    'element.contextmenu': allowAll
  };


  // manual event trigger //////////

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


  var ELEMENT_SELECTOR = 'svg, .djs-element';

  // event handling ///////

  function registerEvent(node, event, localEvent, ignoredFilter) {

    var handler = handlers[localEvent] = function(event) {
      fire(localEvent, event);
    };

    if (ignoredFilter) {
      ignoredFilters[localEvent] = ignoredFilter;
    }

    handler.$delegate = domDelegate.bind(node, ELEMENT_SELECTOR, event, handler);
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


  // hit box updating ////////////////

  eventBus.on([ 'shape.added', 'connection.added' ], function(event) {
    var element = event.element,
        gfx = event.gfx;

    eventBus.fire('interactionEvents.createHit', { element: element, gfx: gfx });
  });

  // Update djs-hit on change.
  // A low priortity is necessary, because djs-hit of labels has to be updated
  // after the label bounds have been updated in the renderer.
  eventBus.on([
    'shape.changed',
    'connection.changed'
  ], LOW_PRIORITY, function(event) {

    var element = event.element,
        gfx = event.gfx;

    eventBus.fire('interactionEvents.updateHit', { element: element, gfx: gfx });
  });

  eventBus.on('interactionEvents.createHit', LOW_PRIORITY, function(event) {
    var element = event.element,
        gfx = event.gfx;

    self.createDefaultHit(element, gfx);
  });

  eventBus.on('interactionEvents.updateHit', function(event) {
    var element = event.element,
        gfx = event.gfx;

    self.updateDefaultHit(element, gfx);
  });


  // hit styles ////////////

  var STROKE_HIT_STYLE = createHitStyle('djs-hit djs-hit-stroke');

  var CLICK_STROKE_HIT_STYLE = createHitStyle('djs-hit djs-hit-click-stroke');

  var ALL_HIT_STYLE = createHitStyle('djs-hit djs-hit-all');

  var HIT_TYPES = {
    'all': ALL_HIT_STYLE,
    'click-stroke': CLICK_STROKE_HIT_STYLE,
    'stroke': STROKE_HIT_STYLE
  };

  function createHitStyle(classNames, attrs) {

    attrs = assign({
      stroke: 'white',
      strokeWidth: 15
    }, attrs || {});

    return styles.cls(classNames, [ 'no-fill', 'no-border' ], attrs);
  }


  // style helpers ///////////////

  function applyStyle(hit, type) {

    var attrs = HIT_TYPES[type];

    if (!attrs) {
      throw new Error('invalid hit type <' + type + '>');
    }

    svgAttr(hit, attrs);

    return hit;
  }

  function appendHit(gfx, hit) {
    svgAppend(gfx, hit);
  }


  // API

  /**
   * Remove hints on the given graphics.
   *
   * @param {SVGElement} gfx
   */
  this.removeHits = function(gfx) {
    var hits = domQueryAll('.djs-hit', gfx);

    forEach(hits, svgRemove);
  };

  /**
   * Create default hit for the given element.
   *
   * @param {djs.model.Base} element
   * @param {SVGElement} gfx
   *
   * @return {SVGElement} created hit
   */
  this.createDefaultHit = function(element, gfx) {
    var waypoints = element.waypoints,
        isFrame = element.isFrame,
        boxType;

    if (waypoints) {
      return this.createWaypointsHit(gfx, waypoints);
    } else {

      boxType = isFrame ? 'stroke' : 'all';

      return this.createBoxHit(gfx, boxType, {
        width: element.width,
        height: element.height
      });
    }
  };

  /**
   * Create hits for the given waypoints.
   *
   * @param {SVGElement} gfx
   * @param {Array<Point>} waypoints
   *
   * @return {SVGElement}
   */
  this.createWaypointsHit = function(gfx, waypoints) {

    var hit = createLine(waypoints);

    applyStyle(hit, 'stroke');

    appendHit(gfx, hit);

    return hit;
  };

  /**
   * Create hits for a box.
   *
   * @param {SVGElement} gfx
   * @param {String} hitType
   * @param {Object} attrs
   *
   * @return {SVGElement}
   */
  this.createBoxHit = function(gfx, type, attrs) {

    attrs = assign({
      x: 0,
      y: 0
    }, attrs);

    var hit = svgCreate('rect');

    applyStyle(hit, type);

    svgAttr(hit, attrs);

    appendHit(gfx, hit);

    return hit;
  };

  /**
   * Update default hit of the element.
   *
   * @param  {djs.model.Base} element
   * @param  {SVGElement} gfx
   *
   * @return {SVGElement} updated hit
   */
  this.updateDefaultHit = function(element, gfx) {

    var hit = domQuery('.djs-hit', gfx);

    if (!hit) {
      return;
    }

    if (element.waypoints) {
      updateLine(hit, element.waypoints);
    } else {
      svgAttr(hit, {
        width: element.width,
        height: element.height
      });
    }

    return hit;
  };

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