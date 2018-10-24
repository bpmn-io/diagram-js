/* global sinon */

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

var KEYS = [ 'v', 'V' ];

describe('features/keyboard - paste', function() {

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
    { desc: 'should call paste',     keys: KEYS, ctrlKey: true,  called: true },
    { desc: 'should not call paste', keys: KEYS, ctrlKey: false, called: false },
  ];
  /* eslint-enable */

  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var pasteSpy = sinon.spy(editorActions, 'trigger');

        var event = createKeyEvent(
          key,
          {
            ctrlKey: testCase.ctrlKey
          }
        );

        // when
        keyboard._keyHandler(event);

        // then
        expect(pasteSpy.calledWith('paste')).to.be.equal(testCase.called);

      }));

    });

  });

});