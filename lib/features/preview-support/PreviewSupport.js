import {
  forEach
} from 'min-dash';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  clone as svgClone,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import { query as domQuery } from 'min-dom';

import { getVisual } from '../../util/GraphicsUtil';

/**
 * @typedef {import('../../core/Types').ElementLike} Element
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../../draw/Styles').default} Styles
 */

var MARKER_TYPES = [
  'marker-start',
  'marker-mid',
  'marker-end'
];

var NODES_CAN_HAVE_MARKER = [
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'path',
  'rect'
];


/**
 * Adds support for previews of moving/resizing elements.
 *
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Styles} styles
 */
export default function PreviewSupport(elementRegistry, eventBus, canvas, styles) {
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;
  this._styles = styles;

  this._clonedMarkers = {};

  var self = this;

  eventBus.on('drag.cleanup', function() {
    forEach(self._clonedMarkers, function(clonedMarker) {
      svgRemove(clonedMarker);
    });

    self._clonedMarkers = {};
  });
}

PreviewSupport.$inject = [
  'elementRegistry',
  'eventBus',
  'canvas',
  'styles'
];


/**
 * Returns graphics of an element.
 *
 * @param {Element} element
 *
 * @return {SVGElement}
 */
PreviewSupport.prototype.getGfx = function(element) {
  return this._elementRegistry.getGraphics(element);
};

/**
 * Adds a move preview of a given shape to a given SVG group.
 *
 * @param {Element} element The element to be moved.
 * @param {SVGElement} group The SVG group to add the preview to.
 * @param {SVGElement} [gfx] The optional graphical element of the element.
 *
 * @return {SVGElement} The preview.
 */
PreviewSupport.prototype.addDragger = function(element, group, gfx) {
  gfx = gfx || this.getGfx(element);

  var dragger = svgClone(gfx);
  var bbox = gfx.getBoundingClientRect();

  this._cloneMarkers(getVisual(dragger));

  svgAttr(dragger, this._styles.cls('djs-dragger', [], {
    x: bbox.top,
    y: bbox.left
  }));

  svgAppend(group, dragger);

  return dragger;
};

/**
 * Adds a resize preview of a given shape to a given SVG group.
 *
 * @param {Shape} shape The element to be resized.
 * @param {SVGElement} group The SVG group to add the preview to.
 *
 * @return {SVGElement} The preview.
 */
PreviewSupport.prototype.addFrame = function(shape, group) {

  var frame = svgCreate('rect', {
    class: 'djs-resize-overlay',
    width:  shape.width,
    height: shape.height,
    x: shape.x,
    y: shape.y
  });

  svgAppend(group, frame);

  return frame;
};

/**
 * Clone all markers referenced by a node and its child nodes.
 *
 * @param {SVGElement} gfx
 */
PreviewSupport.prototype._cloneMarkers = function(gfx) {
  var self = this;

  if (gfx.childNodes) {

    // TODO: use forEach once we drop PhantomJS
    for (var i = 0; i < gfx.childNodes.length; i++) {

      // recursively clone markers of child nodes
      self._cloneMarkers(gfx.childNodes[ i ]);
    }
  }

  if (!canHaveMarker(gfx)) {
    return;
  }

  MARKER_TYPES.forEach(function(markerType) {
    if (svgAttr(gfx, markerType)) {
      var marker = getMarker(gfx, markerType, self._canvas.getContainer());

      self._cloneMarker(gfx, marker, markerType);
    }
  });
};

/**
 * Clone marker referenced by an element.
 *
 * @param {SVGElement} gfx
 * @param {SVGElement} marker
 * @param {string} markerType
 */
PreviewSupport.prototype._cloneMarker = function(gfx, marker, markerType) {
  var markerId = marker.id;

  var clonedMarker = this._clonedMarkers[ markerId ];

  if (!clonedMarker) {
    clonedMarker = svgClone(marker);

    var clonedMarkerId = markerId + '-clone';

    clonedMarker.id = clonedMarkerId;

    svgClasses(clonedMarker)
      .add('djs-dragger')
      .add('djs-dragger-marker');

    this._clonedMarkers[ markerId ] = clonedMarker;

    var defs = domQuery('defs', this._canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');

      svgAppend(this._canvas._svg, defs);
    }

    svgAppend(defs, clonedMarker);
  }

  var reference = idToReference(this._clonedMarkers[ markerId ].id);

  svgAttr(gfx, markerType, reference);
};

// helpers //////////

/**
 * Get marker of given type referenced by node.
 *
 * @param {HTMLElement} node
 * @param {string} markerType
 * @param {HTMLElement} [parentNode]
 *
 * @param {HTMLElement}
 */
function getMarker(node, markerType, parentNode) {
  var id = referenceToId(svgAttr(node, markerType));

  return domQuery('marker#' + id, parentNode || document);
}

/**
 * Get ID of fragment within current document from its functional IRI reference.
 * References may use single or double quotes.
 *
 * @param {string} reference
 *
 * @return {string}
 */
function referenceToId(reference) {
  return reference.match(/url\(['"]?#([^'"]*)['"]?\)/)[1];
}

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
 * Check wether node type can have marker attributes.
 *
 * @param {HTMLElement} node
 *
 * @return {boolean}
 */
function canHaveMarker(node) {
  return NODES_CAN_HAVE_MARKER.indexOf(node.nodeName) !== -1;
}