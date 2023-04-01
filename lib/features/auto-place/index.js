import AutoPlace from './AutoPlace';
import AutoPlaceSelectionBehavior from './AutoPlaceSelectionBehavior';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'autoPlaceSelectionBehavior' ],
  autoPlace: [ 'type', AutoPlace ],
  autoPlaceSelectionBehavior: [ 'type', AutoPlaceSelectionBehavior ]
};