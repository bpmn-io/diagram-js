import CommandModule from '../../command/index.js';
import ChangeSupportModule from '../change-support/index.js';
import SelectionModule from '../selection/index.js';
import RulesModule from '../rules/index.js';

import Modeling from './Modeling.js';
import BaseLayouter from '../../layout/BaseLayouter.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    CommandModule,
    ChangeSupportModule,
    SelectionModule,
    RulesModule
  ],
  __init__: [ 'modeling' ],
  modeling: [ 'type', Modeling ],
  layouter: [ 'type', BaseLayouter ]
};
