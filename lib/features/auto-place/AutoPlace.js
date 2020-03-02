import {
  asTRBL,
  getMid
} from '../../layout/LayoutUtil';

import { DEFAULT_DISTANCE } from './AutoPlaceUtil';

var LOW_PRIORITY = 100;


/**
 * A service that places elements connected to existing ones
 * to an appropriate position in an _automated_ fashion.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function AutoPlace(eventBus, modeling) {

  eventBus.on('autoPlace', LOW_PRIORITY, function(context) {
    var shape = context.shape,
        source = context.source;

    return getNewShapePosition(source, shape);
  });

  /**
   * Append shape to source at appropriate position.
   *
   * @param {djs.model.Shape} source
   * @param {djs.model.Shape} shape
   *
   * @return {djs.model.Shape} appended shape
   */
  this.append = function(source, shape, hints) {

    eventBus.fire('autoPlace.start', {
      source: source,
      shape: shape
    });

    // allow others to provide the position
    var position = eventBus.fire('autoPlace', {
      source: source,
      shape: shape
    });

    var newShape = modeling.appendShape(source, shape, position, source.parent, hints);

    eventBus.fire('autoPlace.end', {
      source: source,
      shape: newShape
    });

    return newShape;
  };

}

AutoPlace.$inject = [
  'eventBus',
  'modeling'
];

// helpers //////////

/**
 * Find the new position for the target element to
 * connect to source.
 *
 * @param  {djs.model.Shape} source
 * @param  {djs.model.Shape} element
 * @param  {Object} [hints]
 * @param  {Object} [hints.defaultDistance]
 *
 * @returns {Point}
 */
function getNewShapePosition(source, element, hints) {
  if (!hints) {
    hints = {};
  }

  var distance = hints.defaultDistance || DEFAULT_DISTANCE;

  var sourceMid = getMid(source),
      sourceTrbl = asTRBL(source);

  // simply put element right next to source
  return {
    x: sourceTrbl.right + distance + element.width / 2,
    y: sourceMid.y
  };
}