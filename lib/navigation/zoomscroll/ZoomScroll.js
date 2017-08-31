'use strict';

var domEvent = require('min-dom/lib/event'),
    domClosest = require('min-dom/lib/closest');

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier,
    hasSecondaryModifier = require('../../util/Mouse').hasSecondaryModifier;

var isMac = require('../../util/Platform').isMac;

var getStepSize = require('./ZoomUtil').getStepSize,
    cap = require('./ZoomUtil').cap;

var log10 = require('../../util/Math').log10;

var bind = require('lodash/function/bind');

var RANGE = { min: 0.2, max: 4 },
    NUM_STEPS = 10;

var DELTA_THRESHOLD = 0.1;


/**
 * An implementation of zooming and scrolling within the
 * {@link Canvas} via the mouse wheel.
 *
 * Mouse wheel zooming / scrolling may be disabled using
 * the {@link toggle(enabled)} method.
 *
 * Additionally users can define the initial enabled state
 * by passing `{ zoomScroll: { enabled: false } }` at diagram
 * initialization.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Object} config
 */
function ZoomScroll(eventBus, canvas, config) {

  this._enabled = false;

  this._canvas = canvas;
  this._container = canvas._container;

  this._handleWheel = bind(this._handleWheel, this);

  var newEnabled = !config || config.enabled !== false;

  this.totalDelta = 0;

  var self = this;

  eventBus.on('canvas.init', function(e) {
    self._init(newEnabled);
  });
}

ZoomScroll.$inject = [ 'eventBus', 'canvas', 'config.zoomScroll' ];

module.exports = ZoomScroll;

ZoomScroll.prototype.scroll = function scroll(delta) {
  this._canvas.scroll(delta);
};


ZoomScroll.prototype.reset = function reset() {
  this._canvas.zoom('fit-viewport');
};

/**
 * Zoom depending on delta.
 * 
 * @param {number} delta - Zoom delta.
 * @param {Object} position - Zoom position.
 */
ZoomScroll.prototype.zoom = function zoom(delta, position) {

  // zoom with half the step size of stepZoom
  var stepSize = getStepSize(RANGE, NUM_STEPS * 2);

  // add until threshold reached
  this.totalDelta += delta;

  if (Math.abs(this.totalDelta) > DELTA_THRESHOLD) {
    this._zoom(delta, position, stepSize);

    // reset
    this.totalDelta = 0;
  }
};


ZoomScroll.prototype._handleWheel = function handleWheel(event) {
  // event is already handled by '.djs-scrollable'
  if (domClosest(event.target, '.djs-scrollable', true)) {
    return;
  }

  var element = this._container;

  event.preventDefault();

  // mouse-event: SELECTION_KEY
  // mouse-event: AND_KEY
  var isVerticalScroll = hasPrimaryModifier(event),
      isHorizontalScroll = hasSecondaryModifier(event);

  var factor;

  if (isVerticalScroll || isHorizontalScroll) {

    if (isMac) {
      factor = event.deltaMode === 0 ? 1.25 : 50;
    } else {
      factor = event.deltaMode === 0 ? 1/40 : 1/2;
    }

    var delta = {};

    if (isHorizontalScroll) {
      delta.dx = (factor * (event.deltaX || event.deltaY));
    } else {
      delta.dy = (factor * event.deltaY);
    }
    this.scroll(delta);
  } else {
    factor = (event.deltaMode === 0 ? 1/40 : 1/2);

    var elementRect = element.getBoundingClientRect();

    var offset =  {
      x: event.clientX - elementRect.left,
      y: event.clientY - elementRect.top
    };

    // zoom in relative to diagram {x,y} coordinates
    this.zoom(event.deltaY * factor / (-5), offset);
  }
};

/**
 * Zoom with fixed step size.
 *
 * @param {number} delta - Zoom delta (1 for zooming in, -1 for out).
 * @param {Object} position - Zoom position.
 */
ZoomScroll.prototype.stepZoom = function stepZoom(delta, position) {

  var stepSize = getStepSize(RANGE, NUM_STEPS);

  this._zoom(delta, position, stepSize);
};


/**
 * Zoom in/out given a step size.
 * 
 * @param {number} delta - Zoom delta. Can be positive or negative.
 * @param {Object} position - Zoom position.
 * @param {number} stepSize - Step size.
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
 * @param  {Boolean} [newEnabled] new enabled state
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
