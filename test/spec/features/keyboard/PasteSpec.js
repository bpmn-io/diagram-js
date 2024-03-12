import {
  forEach
} from 'min-dash';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper.js';

import copyPasteModule from 'lib/features/copy-paste/index.js';
import modelingModule from 'lib/features/modeling/index.js';
import keyboardModule from 'lib/features/keyboard/index.js';
import editorActionsModule from 'lib/features/editor-actions/index.js';

import { createKeyEvent } from 'test/util/KeyEvents.js';

var KEYS_PASTE = [ 'v', 'V' ];


describe('features/keyboard - paste', function() {

  var defaultDiagramConfig = {
    modules: [
      copyPasteModule,
      modelingModule,
      editorActionsModule,
      keyboardModule,
      modelingModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  var decisionTable = [ {
    desc: 'should call paste',
    keys: KEYS_PASTE,
    ctrlKey: true,
    called: true
  }, {
    desc: 'should not call paste',
    keys: KEYS_PASTE,
    ctrlKey: false,
    called: false
  } ];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var pasteSpy = sinon.spy(editorActions, 'trigger');

        var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

        // when
        keyboard._keyHandler(event);

        // then
        expect(pasteSpy.calledWith('paste')).to.be.equal(testCase.called);
      }));

    });

  });

});