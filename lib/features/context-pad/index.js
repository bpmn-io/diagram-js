import InteractionEventsModule from '../interaction-events';
import OverlaysModule from '../overlays';

import ContextPad from './ContextPad';


export default {
  __depends__: [
    InteractionEventsModule,
    OverlaysModule
  ],
  contextPad: [ 'type', ContextPad ]
};