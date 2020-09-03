import {
  asTRBL,
  getMid
} from '../../layout/LayoutUtil';

import { DEFAULT_DISTANCE } from './AutoPlaceUtil';

const LOW_PRIORITY = 100;


/**
 * A service that places elements connected to existing ones
 * to an appropriate position in an _automated_ fashion.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default class AutoPlace {

  constructor(eventBus, modeling) {
    eventBus.on('autoPlace', LOW_PRIORITY, context => {
      const shape = context.shape;
      const source = context.source;
  
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
    this.append = (source, shape, hints) => {
  
      eventBus.fire('autoPlace.start', {
        source,
        shape
      });
  
      // allow others to provide the position
      const position = eventBus.fire('autoPlace', {
        source,
        shape
      });
  
      const newShape = modeling.appendShape(source, shape, position, source.parent, hints);
  
      eventBus.fire('autoPlace.end', {
        source,
        shape: newShape
      });
  
      return newShape;
    };
  }
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
function getNewShapePosition(source, {width}, hints) {
  if (!hints) {
    hints = {};
  }

  const distance = hints.defaultDistance || DEFAULT_DISTANCE;

  const sourceMid = getMid(source);
  const sourceTrbl = asTRBL(source);

  // simply put element right next to source
  return {
    x: sourceTrbl.right + distance + width / 2,
    y: sourceMid.y
  };
}