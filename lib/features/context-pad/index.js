import InteractionEventsModule from '../interaction-events';
import OverlaysModule from '../overlays';

import ContextPad from './ContextPad';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    InteractionEventsModule,
    OverlaysModule
  ],
  contextPad: [ 'type', ContextPad ]
};