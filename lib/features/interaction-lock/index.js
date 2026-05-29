import InteractionLock from './InteractionLock';
import InteractionLockBehavior from './InteractionLockBehavior';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'interactionLockBehavior' ],
  interactionLock: [ 'type', InteractionLock ],
  interactionLockBehavior: [ 'type', InteractionLockBehavior ]
};
