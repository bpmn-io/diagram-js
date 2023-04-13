import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

/**
 * @typedef {import('../../core/EventBus').default} EventBus
 */

/**
 * @param {EventBus} eventBus
 */
export default function TouchFix(eventBus) {

  var self = this;

  eventBus.on('canvas.init', function(e) {
    self.addBBoxMarker(e.svg);
  });
}

TouchFix.$inject = [ 'eventBus' ];


/**
 * Safari mobile (iOS 7) does not fire touchstart event in <SVG> element
 * if there is no shape between 0,0 and viewport elements origin.
 *
 * So touchstart event is only fired when the <g class="viewport"> element was hit.
 * Putting an element over and below the 'viewport' fixes that behavior.
 *
 * @param {SVGElement} svg
 */
TouchFix.prototype.addBBoxMarker = function(svg) {

  var markerStyle = {
    fill: 'none',
    class: 'outer-bound-marker'
  };

  var rect1 = svgCreate('rect');
  svgAttr(rect1, {
    x: -10000,
    y: 10000,
    width: 10,
    height: 10
  });
  svgAttr(rect1, markerStyle);

  svgAppend(svg, rect1);

  var rect2 = svgCreate('rect');
  svgAttr(rect2, {
    x: 10000,
    y: 10000,
    width: 10,
    height: 10
  });
  svgAttr(rect2, markerStyle);

  svgAppend(svg, rect2);
};
