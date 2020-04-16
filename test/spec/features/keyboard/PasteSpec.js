import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  forEach
} from 'min-dash';

import copyPasteModule from 'lib/features/copy-paste';
import modelingModule from 'lib/features/modeling';
import keyboardModule from 'lib/features/keyboard';
import editorActionsModule from 'lib/features/editor-actions';

import { createKeyEvent } from 'test/util/KeyEvents';

var V_KEY_CODE = 86;
var KEYS = [ 'v', 'V', V_KEY_CODE ];


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

  var decisionTable = [{
    desc: 'should call paste',
    keys: KEYS,
    ctrlKey: true,
    called: true
  }, {
    desc: 'should not call paste',
    keys: KEYS,
    ctrlKey: false,
    called: false
  }];

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