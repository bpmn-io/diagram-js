import SelectionModule from '../selection';
import RulesModule from '../rules';
import DraggingModule from '../dragging';

import Connect from './Connect';

export default {
  __depends__: [
    SelectionModule,
    RulesModule,
    DraggingModule
  ],
  connect: [ 'type', Connect ]
};
