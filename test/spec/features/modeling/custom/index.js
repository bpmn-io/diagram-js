import CommandModule from 'diagram-js/lib/command';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import SelectionModule from 'diagram-js/lib/features/selection';
import RulesModule from 'diagram-js/lib/features/rules';

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
