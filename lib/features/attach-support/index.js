import RulesModule from '../rules';

import AttachSupport from './AttachSupport';

export default {
  __depends__: [
    RulesModule
  ],
  __init__: [ 'attachSupport' ],
  attachSupport: [ 'type', AttachSupport ]
};
