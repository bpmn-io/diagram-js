import inherits from 'inherits-browser';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import {
  query as domQuery
} from 'min-dom';

import DefaultRenderer from 'lib/draw/DefaultRenderer';

import {
  createLine
} from 'lib/util/RenderUtil';

/**
 * @typedef {import('../../model').Connection} Connection
 */

var HIGH_PRIORITY = 3000;

var CONNECTION_STYLE = {
  fill: 'none',
  stroke: 'fuchsia',
  strokeWidth: 5
};

var MARKER_TYPES = [
  'marker-start',
  'marker-mid',
  'marker-end'
];

/**
 * A renderer that can render markers.
 */
export default function MarkerRenderer(canvas, eventBus, styles) {
  DefaultRenderer.call(this, eventBus, styles, HIGH_PRIORITY);

  this._canvas = canvas;
}

inherits(MarkerRenderer, DefaultRenderer);

MarkerRenderer.$inject = [
  'canvas',
  'eventBus',
  'styles'
];

MarkerRenderer.prototype.canRender = function() {
  return true;
};

MarkerRenderer.prototype.drawConnection = function(parentGfx, connection) {
  var line = createLine(connection.waypoints, CONNECTION_STYLE);

  svgAppend(parentGfx, line);

  var self = this;

  MARKER_TYPES.forEach(function(markerType) {
    if (hasMarker(connection, markerType)) {
      self.addMarker(parentGfx, line, markerType, connection.id);
    }
  });

  return line;
};

MarkerRenderer.prototype.addMarker = function(parentGfx, gfx, markerType, id) {
  var defs, marker;
  parentGfx = parentGfx || this._canvas._svg;

  marker = svgCreate('marker');

  marker.id = markerType + '-' + id;

  svgAttr(marker, {
    refX: 5,
    refY: 5,
    viewBox: '0 0 10 10'
  });

  var circle = svgCreate('circle');

  svgAttr(circle, {
    cx: 5,
    cy: 5,
    fill: 'fuchsia',
    r: 5
  });

  svgAppend(marker, circle);

  defs = domQuery(':scope > defs', parentGfx);

  if (!defs) {
    defs = svgCreate('defs');

    svgAppend(parentGfx, defs);
  }

  svgAppend(defs, marker);

  var reference = idToReference(marker.id);

  svgAttr(gfx, markerType, reference);
};

// helpers //////////

/**
 * Get functional IRI reference for given ID of fragment within current document.
 *
 * @param {string} id
 *
 * @return {string}
 */
function idToReference(id) {
  return 'url(#' + id + ')';
}

/**
 * Check wether given connection has marker of given type.
 *
 * @param {Connection} connection
 * @param {string} markerType
 *
 * @return {boolean}
 */
function hasMarker(connection, markerType) {
  return connection.marker && connection.marker[ markerType.split('-').pop() ];
}