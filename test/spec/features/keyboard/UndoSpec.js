import {
  forEach
} from 'min-dash';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper.js';

import modelingModule from 'diagram-js/lib/features/modeling/index.js';
import editorActionsModule from 'diagram-js/lib/features/editor-actions/index.js';
import keyboardModule from 'diagram-js/lib/features/keyboard/index.js';

import { createKeyEvent } from 'test/util/KeyEvents.js';


var KEYS_UNDO = [ 'z', 'Z' ];

describe('features/keyboard - undo', function() {

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
    desc: 'should call undo',
    keys: KEYS_UNDO,
    ctrlKey: true,
    shiftKey: false,
    called: true
  }, {
    desc: 'should not call undo',
    keys: KEYS_UNDO,
    ctrlKey: true,
    shiftKey: true,
    called: false
  }, {
    desc: 'should not call undo',
    keys: KEYS_UNDO,
    ctrlKey: false,
    shiftKey: true,
    called: false
  }, {
    desc: 'should not call undo',
    keys: KEYS_UNDO,
    ctrlKey: false,
    shiftKey: false,
    called: false
  } ];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var undoSpy = sinon.spy(editorActions, 'trigger');

        var event = createKeyEvent(key, {
          ctrlKey: testCase.ctrlKey,
          shiftKey: testCase.shiftKey
        });

        // when
        keyboard._keyHandler(event);

        // then
        expect(undoSpy.calledWith('undo')).to.be.equal(testCase.called);
      }));

    });

  });

});