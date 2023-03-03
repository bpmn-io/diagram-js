import Replace from './Replace';
import ReplaceSelectionBehavior from './ReplaceSelectionBehavior';

export default {
  __init__: [ 'replace', 'replaceSelectionBehavior' ],
  replaceSelectionBehavior: [ 'type', ReplaceSelectionBehavior ],
  replace: [ 'type', Replace ]
};