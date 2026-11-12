import {
  event as domEvent,
  closest as domClosest
} from 'min-dom';

import {
  getStepSize,
  cap
} from './ZoomUtil.js';

import {
  log10
} from '../../util/Math.js';

import {
  isMac
} from '../../util/Platform.js';

import {
  bind
} from 'min-dash';

/**
 * @typedef {import('../../core/Canvas.js').default} Canvas
 * @typedef {import('../../core/EventBus.js').default} EventBus
 *
 * @typedef {import('../../util/Types.js').Point} Point
 * @typedef {import('../../util/Types.js').ScrollDelta} ScrollDelta
 */

var sign = Math.sign || function(n) {
  return n >= 0 ? 1 : -1;
};

var RANGE = { min: 0.2, max: 4 },
    NUM_STEPS = 10;

var DELTA_THRESHOLD = 0.1;

var DEFAULT_SCALE = 0.75;

/**
 * An implementation of zooming and scrolling within the
 * {@link Canvas} via the mouse wheel.
 *
 * Mouse wheel zooming / scrolling may be disabled using
 * the {@link toggle(enabled)} method.
 *
 * @param {Object} [config]
 * @param {boolean} [config.enabled=true] default enabled state
 * @param {number} [config.scale=.75] scroll sensivity
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function ZoomScroll(config, eventBus, canvas) {

  config = config || {};

  this._enabled = false;

  this._canvas = canvas;
  this._container = canvas._container;

  this._handleWheel = bind(this._handleWheel, this);

  this._totalDelta = 0;
  this._scale = config.scale || DEFAULT_SCALE;

  var self = this;

  var container = this._container;

  function handleMouseOver(event) {
    if (!container.contains(event.relatedTarget)) {
      self._init(config.enabled !== false);
    }
  }

  function handleMouseOut(event) {
    if (!container.contains(event.relatedTarget)) {
      self._init(false);
    }
  }

  // HTML overlays and context pads are siblings of the SVG canvas.
  domEvent.bind(container, 'mouseover', handleMouseOver, true);
  domEvent.bind(container, 'mouseout', handleMouseOut, true);

  eventBus.on('canvas.destroy', function() {
    self.toggle(false);
    domEvent.unbind(container, 'mouseover', handleMouseOver, true);
    domEvent.unbind(container, 'mouseout', handleMouseOut, true);
  });

}

ZoomScroll.$inject = [
  'config.zoomScroll',
  'eventBus',
  'canvas'
];

/**
 * @param {ScrollDelta} delta
 */
ZoomScroll.prototype.scroll = function scroll(delta) {
  this._canvas.scroll(delta);
};


ZoomScroll.prototype.reset = function reset() {
  this._canvas.zoom('fit-viewport');
};

/**
 * Zoom depending on delta.
 *
 * @param {number} delta
 * @param {Point} position
 */
ZoomScroll.prototype.zoom = function zoom(delta, position) {

  // zoom with half the step size of stepZoom
  var stepSize = getStepSize(RANGE, NUM_STEPS * 2);

  // add until threshold reached
  this._totalDelta += delta;

  if (Math.abs(this._totalDelta) > DELTA_THRESHOLD) {
    this._zoom(delta, position, stepSize);

    // reset
    this._totalDelta = 0;
  }
};


ZoomScroll.prototype._handleWheel = function handleWheel(event) {

  if (!this._enabled || event.defaultPrevented) {
    return;
  }

  // Search/pop-up panels and the palette keep their own wheel behavior.
  if (domClosest(event.target, '.djs-scrollable, .djs-palette', true)) {
    return;
  }

  var element = this._container;

  // pinch to zoom is mapped to wheel + ctrlKey = true
  // in modern browsers (!)

  var isZoom = event.ctrlKey || (isMac() && event.metaKey);

  var isHorizontalScroll = event.shiftKey;

  if (!isZoom && canScrollOverlay(
    event.target,
    element,
    isHorizontalScroll ? event.deltaY : event.deltaX,
    isHorizontalScroll ? 0 : event.deltaY
  )) {
    return;
  }

  event.preventDefault();

  var factor = -1 * this._scale,
      delta;

  if (isZoom) {
    factor *= event.deltaMode === 0 ? 0.020 : 0.32;
  } else {
    factor *= event.deltaMode === 0 ? 1.0 : 16.0;
  }

  if (isZoom) {
    var elementRect = element.getBoundingClientRect();

    var offset = {
      x: event.clientX - elementRect.left,
      y: event.clientY - elementRect.top
    };

    delta = (
      Math.sqrt(
        Math.pow(event.deltaY, 2) +
        Math.pow(event.deltaX, 2)
      ) * sign(event.deltaY) * factor
    );

    // zoom in relative to diagram {x,y} coordinates
    this.zoom(delta, offset);
  } else {

    if (isHorizontalScroll) {
      delta = {
        dx: factor * event.deltaY,
        dy: 0
      };
    } else {
      delta = {
        dx: factor * event.deltaX,
        dy: factor * event.deltaY
      };
    }

    this.scroll(delta);
  }
};

/**
 * Zoom with fixed step size.
 *
 * @param {number} delta Zoom delta (1 for zooming in, -1 for zooming out).
 * @param {Point} [position]
 */
ZoomScroll.prototype.stepZoom = function stepZoom(delta, position) {

  var stepSize = getStepSize(RANGE, NUM_STEPS);

  this._zoom(delta, position, stepSize);
};


/**
 * Zoom in/out given a step size.
 *
 * @param {number} delta
 * @param {Point} [position]
 * @param {number} stepSize
 */
ZoomScroll.prototype._zoom = function(delta, position, stepSize) {
  var canvas = this._canvas;

  var direction = delta > 0 ? 1 : -1;

  var currentLinearZoomLevel = log10(canvas.zoom());

  // snap to a proximate zoom step
  var newLinearZoomLevel = Math.round(currentLinearZoomLevel / stepSize) * stepSize;

  // increase or decrease one zoom step in the given direction
  newLinearZoomLevel += stepSize * direction;

  // calculate the absolute logarithmic zoom level based on the linear zoom level
  // (e.g. 2 for an absolute x2 zoom)
  var newLogZoomLevel = Math.pow(10, newLinearZoomLevel);

  canvas.zoom(cap(RANGE, newLogZoomLevel), position);
};


/**
 * Toggle the zoom scroll ability via mouse wheel.
 *
 * @param {boolean} [newEnabled] new enabled state
 */
ZoomScroll.prototype.toggle = function toggle(newEnabled) {

  var element = this._container;
  var handleWheel = this._handleWheel;

  var oldEnabled = this._enabled;

  if (typeof newEnabled === 'undefined') {
    newEnabled = !oldEnabled;
  }

  // only react on actual changes
  if (oldEnabled !== newEnabled) {

    // add or remove wheel listener based on
    // changed enabled state
    domEvent[newEnabled ? 'bind' : 'unbind'](element, 'wheel', handleWheel, false);
  }

  this._enabled = newEnabled;

  return newEnabled;
};


ZoomScroll.prototype._init = function(newEnabled) {
  this.toggle(newEnabled);
};


// helpers //////////////////////

/**
 * Check whether a nested scrolling element should receive the wheel event.
 *
 * @param {Element} target
 * @param {HTMLElement} container
 * @param {number} deltaX
 * @param {number} deltaY
 * @return {boolean}
 */
function canScrollOverlay(target, container, deltaX, deltaY) {
  for (var element = target; element && element !== container; element = element.parentElement) {
    if (element.nodeType !== 1) {
      continue;
    }

    var style = window.getComputedStyle(element);

    if (canScroll(element, style, 'x', deltaX) || canScroll(element, style, 'y', deltaY)) {
      return true;
    }
  }

  return false;
}

/**
 * Check native scrolling and scroll containment along one axis.
 *
 * @param {Element} element
 * @param {CSSStyleDeclaration} style
 * @param {'x'|'y'} axis
 * @param {number} delta
 * @return {boolean}
 */
function canScroll(element, style, axis, delta) {
  if (!delta) {
    return false;
  }

  var horizontal = axis === 'x';
  var overflow = horizontal ? style.overflowX : style.overflowY;
  var size = horizontal ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight;

  if (!/^(auto|scroll)$/.test(overflow)) {
    return false;
  }

  // Respect native scroll containment even at the edge of a scrollable overlay.
  var overscroll = horizontal ? style.overscrollBehaviorX : style.overscrollBehaviorY;

  if (overscroll === 'contain' || overscroll === 'none') {
    return true;
  }

  if (size <= 0) {
    return false;
  }

  var position = horizontal ? element.scrollLeft : element.scrollTop;
  var min = horizontal && style.direction === 'rtl' ? -size : 0;
  var max = min + size;

  return delta < 0 ? position > min : position < max;
}
