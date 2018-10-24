import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  forEach
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import editorActionsModule from 'lib/features/editor-actions';
import keyboardModule from 'lib/features/keyboard';

import { createKeyEvent } from 'test/util/KeyEvents';

var KEYS = {
  ZOOM_IN: [ '+', 'Add', '=' ],
  ZOOM_OUT: [ '-', 'Subtract', '_' ],
  ZOOM_DEFAULT: [ '0' ],
};

describe('features/keyboard - zoom', function() {

  var defaultDiagramConfig = {
    modules: [
      modelingModule,
      keyboardModule,
      editorActionsModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  beforeEach(bootstrapDiagram(defaultDiagramConfig));

  /* eslint-disable no-multi-spaces */
  var decisionTable = [
    { desc: 'zoom in',      keys: KEYS.ZOOM_IN,      ctrlKey: true, defaultZoom: 3, zoom: 4 },
    { desc: 'zoom out',     keys: KEYS.ZOOM_OUT,     ctrlKey: true, defaultZoom: 3, zoom: 2.456 },
    { desc: 'zoom default', keys: KEYS.ZOOM_DEFAULT, ctrlKey: true, defaultZoom: 3, zoom: 1 },
  ];
  /* eslint-enable */

  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it('should handle ' + key + ' for ' + testCase.desc, inject(function(canvas, keyboard) {

        // given
        canvas.zoom(testCase.defaultZoom);

        var event = createKeyEvent(
          key,
          {
            ctrlKey: testCase.ctrlKey
          }
        );

        // when
        keyboard._keyHandler(event);

        // then
        expect(canvas.zoom()).to.be.equal(testCase.zoom);
        expect(event.defaultPrevented).to.be.true;

      }));

    });

  });

});
