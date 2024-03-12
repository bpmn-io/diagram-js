import AutoPlace from './AutoPlace.js';
import AutoPlaceSelectionBehavior from './AutoPlaceSelectionBehavior.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'autoPlaceSelectionBehavior' ],
  autoPlace: [ 'type', AutoPlace ],
  autoPlaceSelectionBehavior: [ 'type', AutoPlaceSelectionBehavior ]
};