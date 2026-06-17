import { expect } from 'chai';
import { spy } from 'sinon';

import {
  bootstrapDiagram,
  inject
} from 'diagram-js/test/TestHelper.js';

import {
  forEach
} from 'min-dash';

import modelingModule from 'diagram-js/lib/features/modeling';
import editorActionsModule from 'diagram-js/lib/features/editor-actions';
import keyboardModule from 'diagram-js/lib/features/keyboard';

import { createKeyEvent } from 'diagram-js/test/util/KeyEvents.js';


var KEYS = [
  'Backspace',
  'Delete',
  'Del'
];


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

    it('should call remove selection when ' + key + ' is pressed',
      inject(function(keyboard, editorActions) {

        // given
        var removeSelectionSpy = spy(editorActions, 'trigger');

        var event = createKeyEvent(key);

        // when
        keyboard._keyHandler(event);

        // then
        expect(removeSelectionSpy.calledWith('removeSelection')).to.be.true;
      })
    );

  });

});