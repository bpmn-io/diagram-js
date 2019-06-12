import inherits from 'inherits';

import CommandInterceptor from '../../../command/CommandInterceptor';

import { getBBox } from '../../../util/Elements';
import { getMid } from '../../../layout/LayoutUtil';

import { SPACING } from '../GridUtil';

var HIGH_PRIORITY = 2000;


export default function PasteBehavior(eventBus, gridSnapping) {
  CommandInterceptor.call(this, eventBus);

  this.preExecute('elements.paste', HIGH_PRIORITY, function(event) {
    var context = event.context,
        position = context.position,
        tree = context.tree;

    if (!tree[0]) {
      return;
    }

    var mid = getMid(getBBox(tree[0]));

    // snap paste position but maintain each element's grid offset
    position.x = gridSnapping.snapValue(position.x) + (mid.x % SPACING);
    position.y = gridSnapping.snapValue(position.y) + (mid.y % SPACING);
  });
}

PasteBehavior.$inject = [
  'eventBus',
  'gridSnapping'
];

inherits(PasteBehavior, CommandInterceptor);