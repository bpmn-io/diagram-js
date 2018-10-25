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

var spy = sinon.spy;

var KEYS = [ 'z', 'Z' ];


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

  var decisionTable = [{
    desc: 'should call undo',
    keys: KEYS,
    ctrlKey: true,
    shiftKey: false,
    called: true
  }, {
    desc: 'should not call undo',
    keys: KEYS,
    ctrlKey: true,
    shiftKey: true,
    called: false
  }, {
    desc: 'should not call undo',
    keys: KEYS,
    ctrlKey: false,
    shiftKey: true,
    called: false
  }, {
    desc: 'should not call undo',
    keys: KEYS,
    ctrlKey: false,
    shiftKey: false,
    called: false
  }];

  beforeEach(bootstrapDiagram(defaultDiagramConfig));


  forEach(decisionTable, function(testCase) {

    forEach(testCase.keys, function(key) {

      it(testCase.desc, inject(function(keyboard, editorActions) {

        // given
        var undoSpy = spy(editorActions, 'trigger');

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