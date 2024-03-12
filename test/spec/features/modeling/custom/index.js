import CommandModule from 'lib/command/index.js';
import ChangeSupportModule from 'lib/features/change-support/index.js';
import SelectionModule from 'lib/features/selection/index.js';
import RulesModule from 'lib/features/rules/index.js';

import Modeling from 'lib/features/modeling/Modeling.js';
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
