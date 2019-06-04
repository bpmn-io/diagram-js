import DraggingModule from '../dragging';
import SelectionModule from '../selection';
import RulesModule from '../rules';

import Create from './Create';


export default {
  __depends__: [
    DraggingModule,
    SelectionModule,
    RulesModule
  ],
  create: [ 'type', Create ]
};
