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

var KEYS = [ 'Delete' ];


describe('features/keyboard - remove selection', function() {

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


  forEach(KEYS, function(key) {

    it('should call remove selection', inject(function(keyboard, editorActions) {

      // given
      var removeSelectionSpy = spy(editorActions, 'trigger');

      var event = createKeyEvent(key);

      // when
      keyboard._keyHandler(event);

      // then
      expect(removeSelectionSpy.calledWith('removeSelection')).to.be.true;
    }));

  });

});