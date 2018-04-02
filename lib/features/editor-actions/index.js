import SelectionModule from '../selection';
import CopyPasteModule from '../copy-paste';
import ZoomScrollModule from '../../navigation/zoomscroll';

import EditorActions from './EditorActions';

export default {
  __depends__: [
    SelectionModule,
    CopyPasteModule,
    ZoomScrollModule
  ],
  __init__: [ 'editorActions' ],
  editorActions: [ 'type', EditorActions ]
};
