import CommandModule from 'diagram-js/lib/command/index.js';
import ChangeSupportModule from 'diagram-js/lib/features/change-support/index.js';
import SelectionModule from 'diagram-js/lib/features/selection/index.js';
import RulesModule from 'diagram-js/lib/features/rules/index.js';

import Modeling from 'diagram-js/lib/features/modeling/Modeling.js';
import CustomLayouter from './CustomLayouter.js';


export default {
  __depends__: [
    CommandModule,
    ChangeSupportModule,
    SelectionModule,
    RulesModule
  ],
  __init__: [ 'modeling' ],
  modeling: [ 'type', Modeling ],
  layouter: [ 'type', CustomLayouter ]
};
