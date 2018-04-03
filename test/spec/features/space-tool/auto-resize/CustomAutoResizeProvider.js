import inherits from 'inherits';

import AutoResizeProvider from 'lib/features/auto-resize/AutoResizeProvider';


export default function CustomAutoResizeProvider(eventBus) {
  AutoResizeProvider.call(this, eventBus);

  this.canResize = function(elements, target) {
    return target.parent;
  };
}

inherits(CustomAutoResizeProvider, AutoResizeProvider);