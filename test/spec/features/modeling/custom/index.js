import CommandModule from 'lib/command';
import ChangeSupportModule from 'lib/features/change-support';
import SelectionModule from 'lib/features/selection';
import RulesModule from 'lib/features/rules';

import Modeling from 'lib/features/modeling/Modeling';
import CustomLayouter from './CustomLayouter';


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
