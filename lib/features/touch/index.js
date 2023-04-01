import InteractionEventsModule from '../interaction-events';

import TouchInteractionEvents from './TouchInteractionEvents';
import TouchFix from './TouchFix';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ InteractionEventsModule ],
  __init__: [ 'touchInteractionEvents' ],
  touchInteractionEvents: [ 'type', TouchInteractionEvents ],
  touchFix: [ 'type', TouchFix ]
};