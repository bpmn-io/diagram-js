import InteractionEventsModule from '../interaction-events';
import OverlaysModule from '../overlays';
import SchedulerModule from '../scheduler';

import ContextPad from './ContextPad';


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