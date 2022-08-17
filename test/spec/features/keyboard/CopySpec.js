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

var KEYS_COPY = [ 'c', 'C', 67 ];


describe('features/keyboard - copy', function() {

  var defaultDiagramConfig = {
    modules: [
      copyPasteModule,
      modelingModule,
      keyboardModule,
      modelingModule,
      editorActionsModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  var decisionTable = [
    {
      desc: 'should call copy',
      keys: KEYS_COPY,
      ctrlKey: true,
      called: true
    }, {
      desc: 'should not call copy',
      keys: KEYS_COPY,
      ctrlKey: false,
      called: false
    }
  ];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var copySpy = sinon.spy(editorActions, 'trigger');

        var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

        // when
        keyboard._keyHandler(event);

        // then
        expect(copySpy.calledWith('copy')).to.be.equal(testCase.called);
      }));

    });

  });

});