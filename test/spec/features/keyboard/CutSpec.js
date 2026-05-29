import { expect } from 'chai';
import { spy } from 'sinon';

import {
  bootstrapDiagram,
  inject
} from 'diagram-js/test/TestHelper.js';

import {
  forEach
} from 'min-dash';

import copyPasteModule from 'diagram-js/lib/features/copy-paste/index.js';
import modelingModule from 'diagram-js/lib/features/modeling/index.js';
import keyboardModule from 'diagram-js/lib/features/keyboard/index.js';
import editorActionsModule from 'diagram-js/lib/features/editor-actions/index.js';

import { createKeyEvent } from 'diagram-js/test/util/KeyEvents.js';

var KEYS_CUT = [ 'x', 'X' ];


describe('features/keyboard - cut', function() {

  var defaultDiagramConfig = {
    modules: [
      copyPasteModule,
      modelingModule,
      keyboardModule,
      editorActionsModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  var decisionTable = [
    {
      desc: 'should call cut',
      keys: KEYS_CUT,
      ctrlKey: true,
      called: true
    }, {
      desc: 'should not call cut',
      keys: KEYS_CUT,
      ctrlKey: false,
      called: false
    }
  ];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var cutSpy = spy(editorActions, 'trigger');

        var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

        // when
        keyboard._keyHandler(event);

        // then
        expect(cutSpy.calledWith('cut')).to.be.equal(testCase.called);
      }));

    });

  });

});