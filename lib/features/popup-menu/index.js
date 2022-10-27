import DiagramJSui from '@bpmn-io/diagram-js-ui';
import PopupMenu from './PopupMenu';

export default {
  __depends__: [ DiagramJSui ],
  __init__: [ 'popupMenu' ],
  popupMenu: [ 'type', PopupMenu ]
};
