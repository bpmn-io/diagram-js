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

var KEYS_REDO = [ 'y', 'Y' ];
var KEYS_UNDO = [ 'z', 'Z' ];
var KEY_CODE_Y = 'KeyY';
var KEY_CODE_Z = 'KeyZ';


describe('features/keyboard - redo', function() {

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

  var decisionTable = [ {
    desc: 'should call redo (Y key)',
    keys: KEYS_REDO,
    ctrlKey: true,
    shiftKey: false,
    called: true
  }, {
    desc: 'should call redo (KeyY code)',
    keyCode: KEY_CODE_Y,
    ctrlKey: true,
    shiftKey: false,
    called: true
  }, {
    desc: 'should call redo (Z + Shift)',
    keys: KEYS_UNDO,
    ctrlKey: true,
    shiftKey: true,
    called: true
  }, {
    desc: 'should call redo (KeyZ + Shift)',
    keyCode: KEY_CODE_Z,
    ctrlKey: true,
    shiftKey: true,
    called: true
  }, {
    desc: 'should not call redo',
    keys: KEYS_UNDO,
    ctrlKey: false,
    shiftKey: true,
    called: false
  }, {
    desc: 'should not call redo',
    keys: KEYS_UNDO,
    ctrlKey: true,
    shiftKey: false,
    called: false
  }, {
    desc: 'should not call redo',
    keys: KEYS_REDO,
    ctrlKey: false,
    shiftKey: false,
    called: false
  }, {
    desc: 'should not call redo',
    keys: KEYS_UNDO,
    ctrlKey: false,
    shiftKey: false,
    called: false
  } ];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    if (testCase.keys) {
      forEach(testCase.keys, function(key) {

        it(testCase.desc, inject(function(keyboard, editorActions) {

          // given
          var redoSpy = sinon.spy(editorActions, 'trigger');

          var event = createKeyEvent(key, {
            ctrlKey: testCase.ctrlKey,
            shiftKey: testCase.shiftKey
          });

          // when
          keyboard._keyHandler(event);

          // then
          expect(redoSpy.calledWith('redo')).to.be.equal(testCase.called);
        }));

      });
    } else if (testCase.keyCode) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var redoSpy = sinon.spy(editorActions, 'trigger');

        var key = testCase.keyCode === KEY_CODE_Y ? 'y' : 'z';
        var event = createKeyEvent(key, {
          ctrlKey: testCase.ctrlKey,
          shiftKey: testCase.shiftKey,
          code: testCase.keyCode
        });

        // when
        keyboard._keyHandler(event);

        // then
        expect(redoSpy.calledWith('redo')).to.be.equal(testCase.called);
      }));

    }

  });

});