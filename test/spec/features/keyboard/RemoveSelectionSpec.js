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
        var removeSelectionSpy = sinon.spy(editorActions, 'trigger');

        var event = createKeyEvent(key);

        // when
        keyboard._keyHandler(event);

        // then
        expect(removeSelectionSpy.calledWith('removeSelection')).to.be.true;
      })
    );

  });

});