import inherits from 'inherits-browser';

import AutoResizeProvider from 'lib/features/auto-resize/AutoResizeProvider.js';


export default function CustomAutoResizeProvider(eventBus) {
  AutoResizeProvider.call(this, eventBus);

  this.canResize = function(elements, target) {
    return target.parent;
  };
}

inherits(CustomAutoResizeProvider, AutoResizeProvider);