import InteractionEventsModule from '../interaction-events/index.js';
import OverlaysModule from '../overlays/index.js';
import SchedulerModule from '../scheduler/index.js';

import ContextPad from './ContextPad.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    InteractionEventsModule,
    SchedulerModule,
    OverlaysModule
  ],
  contextPad: [ 'type', ContextPad ]
};