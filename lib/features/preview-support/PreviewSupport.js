import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  clone as svgClone,
  create as svgCreate,
} from 'tiny-svg';

import { query as domQuery } from 'min-dom';

import { getVisual } from '../../util/GraphicsUtil';

import Ids from '../../util/IdGenerator';

/**
 * @typedef {import('../../core/Types').ElementLike} Element
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../../draw/Styles').default} Styles
 */

const cloneIds = new Ids('ps');

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
}

PreviewSupport.$inject = [
  'elementRegistry',
  'eventBus',
  'canvas',
  'styles'
];

// Markers are cleaned up with visuals, keep stub for compatibility
// cf. https://github.com/camunda/camunda-modeler/issues/4307
PreviewSupport.prototype.cleanUp = function() {
  console.warn('PreviewSupport#cleanUp is deprecated and will be removed in future versions. You do not need to manually clean up previews anymore. cf. https://github.com/bpmn-io/diagram-js/pull/906');
};

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
 * @param {string} [className="djs-dragger"] The optional class name to add to the preview.
 *
 * @return {SVGElement} The preview.
 */
PreviewSupport.prototype.addDragger = function(element, group, gfx, className = 'djs-dragger') {
  gfx = gfx || this.getGfx(element);

  var dragger = svgClone(gfx);
  var bbox = gfx.getBoundingClientRect();

  this._cloneMarkers(getVisual(dragger), className);

  svgAttr(dragger, this._styles.cls(className, [], {
    x: bbox.top,
    y: bbox.left
  }));

  svgAppend(group, dragger);

  svgAttr(dragger, 'data-preview-support-element-id', element.id);

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

  svgAttr(frame, 'data-preview-support-element-id', shape.id);

  return frame;
};

/**
 * Clone all markers referenced by a node and its child nodes.
 *
 * @param {SVGElement} gfx
 * @param {string} [className="djs-dragger"]
 */
PreviewSupport.prototype._cloneMarkers = function(gfx, className = 'djs-dragger', rootGfx = gfx) {
  var self = this;

  if (gfx.childNodes) {

    // TODO: use forEach once we drop PhantomJS
    for (var i = 0; i < gfx.childNodes.length; i++) {

      // recursively clone markers of child nodes
      self._cloneMarkers(gfx.childNodes[ i ], className, rootGfx);
    }
  }

  if (!canHaveMarker(gfx)) {
    return;
  }

  MARKER_TYPES.forEach(function(markerType) {
    if (svgAttr(gfx, markerType)) {
      var marker = getMarker(gfx, markerType, self._canvas.getContainer());

      // Only clone marker if it is already present on the DOM
      marker && self._cloneMarker(rootGfx, gfx, marker, markerType, className);
    }
  });
};

/**
 * Clone marker referenced by an element.
 *
 * @param {SVGElement} gfx
 * @param {SVGElement} marker
 * @param {string} markerType
 * @param {string} [className="djs-dragger"]
 */
PreviewSupport.prototype._cloneMarker = function(parentGfx, gfx, marker, markerType, className = 'djs-dragger') {

  // Add a random suffix to the marker ID in case the same marker is previewed multiple times
  var clonedMarkerId = [ marker.id, className, cloneIds.next() ].join('-');

  // reuse marker if it was part of original gfx
  var copiedMarker = domQuery('marker#' + marker.id, parentGfx);

  parentGfx = parentGfx || this._canvas._svg;

  var clonedMarker = copiedMarker || svgClone(marker);

  clonedMarker.id = clonedMarkerId;

  svgClasses(clonedMarker).add(className);

  var defs = domQuery(':scope > defs', parentGfx);

  if (!defs) {
    defs = svgCreate('defs');

    svgAppend(parentGfx, defs);
  }

  svgAppend(defs, clonedMarker);

  var reference = idToReference(clonedMarker.id);

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