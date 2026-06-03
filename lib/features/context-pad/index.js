import InteractionEventsModule from 'diagram-js/lib/features/interaction-events';
import OverlaysModule from 'diagram-js/lib/features/overlays';
import SchedulerModule from 'diagram-js/lib/features/scheduler';

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