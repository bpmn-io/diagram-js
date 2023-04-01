import RulesModule from '../rules';

import AttachSupport from './AttachSupport';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    RulesModule
  ],
  __init__: [ 'attachSupport' ],
  attachSupport: [ 'type', AttachSupport ]
};
