import {
  forEach
} from 'min-dash';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper.js';

import editorActionsModule from 'diagram-js/lib/features/editor-actions/index.js';
import zoomScrollModule from 'diagram-js/lib/navigation/zoomscroll/index.js';
import keyboardModule from 'diagram-js/lib/features/keyboard/index.js';

import { createKeyEvent } from 'test/util/KeyEvents.js';


var KEYS = {
  ZOOM_IN: [ '+', 'Add', '=' ],
  ZOOM_OUT: [ '-', 'Subtract' ],
  ZOOM_DEFAULT: [ '0' ],
};


describe('features/keyboard - zoom', function() {

  var defaultDiagramConfig = {
    modules: [
      keyboardModule,
      editorActionsModule,
      zoomScrollModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  var decisionTable = [ {
    desc: 'zoom in',
    keys: KEYS.ZOOM_IN,
    ctrlKey: true,
    defaultZoom: 3,
    zoom: 4
  }, {
    desc: 'zoom out',
    keys: KEYS.ZOOM_OUT,
    ctrlKey: true,
    defaultZoom: 3,
    zoom: 2.456
  }, {
    desc: 'zoom default',
    keys: KEYS.ZOOM_DEFAULT,
    ctrlKey: true,
    defaultZoom: 3,
    zoom: 1
  } ];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it('should handle ' + key + ' for ' + testCase.desc, inject(function(canvas, keyboard) {

        // given
        canvas.zoom(testCase.defaultZoom);

        var event = createKeyEvent(key, {
          ctrlKey: testCase.ctrlKey
        });

        // when
        keyboard._keyHandler(event);

        // then
        expect(canvas.zoom()).to.be.equal(testCase.zoom);
        expect(event.defaultPrevented).to.be.true;
      }));

    });

  });

});
