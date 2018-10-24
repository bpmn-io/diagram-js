import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  assign,
  forEach
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import editorActionsModule from 'lib/features/editor-actions';
import keyboardModule from 'lib/features/keyboard';

import { createKeyEvent } from 'test/util/KeyEvents';

var KEYS = {
  LEFT: [ 'ArrowLeft', 'Left' ],
  UP: [ 'ArrowUp', 'Up' ],
  RIGHT: [ 'ArrowRight', 'Right' ],
  DOWN: [ 'ArrowDown', 'Down' ],
};


describe('features/keyboard - move canvas', function() {

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


  describe('with default config', function() {

    /* eslint-disable no-multi-spaces */
    var decisionTable = [
      { desc: 'left arrow',            keys: KEYS.LEFT,  shiftKey: false, x: -50, y: 0 },
      { desc: 'right arrow',           keys: KEYS.RIGHT, shiftKey: false, x: 50,  y: 0 },
      { desc: 'up arrow',              keys: KEYS.UP,    shiftKey: false, x: 0,   y: -50 },
      { desc: 'down arrow',            keys: KEYS.DOWN,  shiftKey: false, x: 0,   y: 50 }
    ];
    /* eslint-enable */

    forEach(decisionTable, function(testCase) {

      forEach(testCase.keys, function(key) {

        it('should handle ' + testCase.desc, inject(function(canvas, keyboard) {

          // given
          var event = createKeyEvent(key, { shiftKey: testCase.shiftKey });

          // when
          keyboard._keyHandler(event);

          // then
          expect(canvas.viewbox().x).to.eql(testCase.x);
          expect(canvas.viewbox().y).to.eql(testCase.y);
        }));

      });

    });

  });


  describe('with custom config', function() {

    it('should use custom speed', function() {

      // given
      var keyboardConfig = {
        keyboard: {
          speed: 23
        }
      };

      bootstrapDiagram(assign(defaultDiagramConfig, keyboardConfig))();

      var keyDownEvent = createKeyEvent(KEYS.DOWN[0]);

      getDiagramJS().invoke(function(canvas, keyboard) {

        // when
        keyboard._keyHandler(keyDownEvent);

        // then
        expect(canvas.viewbox().x).to.eql(0);
        expect(canvas.viewbox().y).to.eql(23);

      });
    });


    it('should use natural scrolling if enabled', function() {

      // given
      var keyboardConfig = {
        keyboard: {
          invertY: true
        }
      };

      bootstrapDiagram(assign(defaultDiagramConfig, keyboardConfig))();

      var keyDownEvent = createKeyEvent(KEYS.DOWN[0]),
          keyUpEvent = createKeyEvent(KEYS.UP[0]);

      getDiagramJS().invoke(function(canvas, keyboard) {

        // when
        keyboard._keyHandler(keyDownEvent);

        // then
        expect(canvas.viewbox().x).to.eql(0);
        expect(canvas.viewbox().y).to.eql(-50);

        // when
        keyboard._keyHandler(keyUpEvent);

        // then
        expect(canvas.viewbox().x).to.eql(0);
        expect(canvas.viewbox().y).to.eql(0);

      });

    });

  });

});
