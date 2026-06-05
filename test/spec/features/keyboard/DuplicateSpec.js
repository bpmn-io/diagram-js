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

var KEYS_DUPLICATE = [ 'd', 'D' ];


describe('features/keyboard - duplicate', function() {

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
      desc: 'should call duplicate',
      keys: KEYS_DUPLICATE,
      ctrlKey: true,
      called: true
    }, {
      desc: 'should not call duplicate',
      keys: KEYS_DUPLICATE,
      ctrlKey: false,
      called: false
    }
  ];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var duplicateSpy = spy(editorActions, 'trigger');

        var event = createKeyEvent(key, { ctrlKey: testCase.ctrlKey });

        // when
        keyboard._keyHandler(event);

        // then
        expect(duplicateSpy.calledWith('duplicate')).to.be.equal(testCase.called);
      }));

    });

  });

});