import { expect } from 'chai';
import { spy } from 'sinon';

import {
  bootstrapDiagram,
  inject
} from 'diagram-js/test/TestHelper.js';

import {
  forEach
} from 'min-dash';

import copyPasteModule from 'diagram-js/lib/features/copy-paste';
import modelingModule from 'diagram-js/lib/features/modeling';
import keyboardModule from 'diagram-js/lib/features/keyboard';
import editorActionsModule from 'diagram-js/lib/features/editor-actions';

import { createKeyEvent } from 'diagram-js/test/util/KeyEvents.js';


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
        var pasteSpy = spy(editorActions, 'trigger');

        var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

        // when
        keyboard._keyHandler(event);

        // then
        expect(pasteSpy.calledWith('paste')).to.be.equal(testCase.called);
      }));

    });

  });

});