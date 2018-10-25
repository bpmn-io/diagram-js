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
import keyboardMoveSelectionModule from 'lib/features/keyboard-move-selection';

import { createKeyEvent } from 'test/util/KeyEvents';

var KEYS = {
  LEFT: [ 'ArrowLeft', 'Left' ],
  UP: [ 'ArrowUp', 'Up' ],
  RIGHT: [ 'ArrowRight', 'Right' ],
  DOWN: [ 'ArrowDown', 'Down' ],
};

var BASE_SPEED = 1;
var HIGH_SPEED = 10;

var shape1, shape2;


describe('features/keyboard-move-selection', function() {

  var defaultDiagramConfig = {
    modules: [
      modelingModule,
      keyboardMoveSelectionModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  beforeEach(bootstrapDiagram(defaultDiagramConfig));

  beforeEach(createShapes);

  beforeEach(inject(function(selection) {

    selection.select(shape1);
    selection.select(shape2, true);

  }));


  describe('with default config', function() {

    describe('without shift', function() {

      /* eslint-disable no-multi-spaces */
      var decisionTable = [
        { desc: 'move selection left',  keys: KEYS.LEFT,  deltaX: -BASE_SPEED, deltaY: 0 },
        { desc: 'move selection up',    keys: KEYS.UP,    deltaX: 0,           deltaY: -BASE_SPEED },
        { desc: 'move selection right', keys: KEYS.RIGHT, deltaX: +BASE_SPEED, deltaY: 0 },
        { desc: 'move selection down',  keys: KEYS.DOWN,  deltaX: 0,           deltaY: +BASE_SPEED },
      ];
      /* eslint-enable */


      forEach(decisionTable, function(testCase) {

        forEach(testCase.keys, function(key) {

          it('should ' + testCase.desc, inject(function(keyboard) {

            // given
            var deltaX = testCase.deltaX,
                deltaY = testCase.deltaY,
                event = createKeyEvent(key, { shiftKey: false });

            // when
            keyboard._keyHandler(event);

            // then
            expect(shape1.x).to.eql(10 + deltaX);
            expect(shape1.y).to.eql(10 + deltaY);
            expect(shape2.x).to.eql(150 + deltaX);
            expect(shape2.y).to.eql(10 + deltaY);

          }));

        });

      });

    });

    describe('with shift', function() {

      /* eslint-disable no-multi-spaces */
      var decisionTable = [
        { desc: 'move selection left',  keys: KEYS.LEFT,  deltaX: -HIGH_SPEED, deltaY: 0 },
        { desc: 'move selection up',    keys: KEYS.UP,    deltaX: 0,           deltaY: -HIGH_SPEED },
        { desc: 'move selection right', keys: KEYS.RIGHT, deltaX: +HIGH_SPEED, deltaY: 0 },
        { desc: 'move selection down',  keys: KEYS.DOWN,  deltaX: 0,           deltaY: +HIGH_SPEED },
      ];
      /* eslint-enable */


      forEach(decisionTable, function(testCase) {

        forEach(testCase.keys, function(key) {

          it('should ' + testCase.desc, inject(function(keyboard) {

            // given
            var deltaX = testCase.deltaX,
                deltaY = testCase.deltaY,
                event = createKeyEvent(key, { shiftKey: true });

            // when
            keyboard._keyHandler(event);

            // then
            expect(shape1.x).to.eql(10 + deltaX);
            expect(shape1.y).to.eql(10 + deltaY);
            expect(shape2.x).to.eql(150 + deltaX);
            expect(shape2.y).to.eql(10 + deltaY);

          }));

        });

      });

    });


    describe('with control or command', function() {

      // given
      var TEST_KEYS = Array.prototype.concat(
        KEYS.LEFT,
        KEYS.UP,
        KEYS.RIGHT,
        KEYS.DOWN
      );


      forEach(TEST_KEYS, function(key) {

        it('should not move selection when ' + key + ' and control is pressed',
          inject(function(keyboard) {

            // given
            var event = createKeyEvent(key, { ctrlKey: true });

            // when
            keyboard._keyHandler(event);

            // then
            expect(shape1.x).to.eql(10);
            expect(shape1.y).to.eql(10);
            expect(shape2.x).to.eql(150);
            expect(shape2.y).to.eql(10);

          })
        );

      });

      forEach(TEST_KEYS, function(key) {

        it('should not move selection when ' + key + ' and command is pressed',
          inject(function(keyboard) {

            // given
            var event = createKeyEvent(key, { metaKey: true });

            // when
            keyboard._keyHandler(event);

            // then
            expect(shape1.x).to.eql(10);
            expect(shape1.y).to.eql(10);
            expect(shape2.x).to.eql(150);
            expect(shape2.y).to.eql(10);

          })
        );

      });

    });

  });


  describe('with custom config', function() {

    it('should use custom speed', function() {

      // given
      var CUSTOM_SPEED = 23;

      var keyboardConfig = {
        keyboardMoveSelection: {
          moveSpeed: CUSTOM_SPEED
        }
      };

      bootstrapDiagram(assign(defaultDiagramConfig, keyboardConfig))();

      var keyDownEvent = createKeyEvent(KEYS.DOWN[0]);

      getDiagramJS().invoke(function(selection, keyboard) {

        // given
        createShapes();
        selection.select(shape1);
        selection.select(shape2, true);

        // when
        keyboard._keyHandler(keyDownEvent);

        // then
        expect(shape1.x).to.eql(10);
        expect(shape1.y).to.eql(10 + CUSTOM_SPEED);
        expect(shape2.x).to.eql(150);
        expect(shape2.y).to.eql(10 + CUSTOM_SPEED);

      });

    });


    it('should use custom modified speed', function() {

      // given
      var CUSTOM_HIGH_SPEED = 77;

      var keyboardConfig = {
        keyboardMoveSelection: {
          moveSpeedAccelerated: CUSTOM_HIGH_SPEED
        }
      };

      bootstrapDiagram(assign(defaultDiagramConfig, keyboardConfig))();

      var keyDownEvent = createKeyEvent(KEYS.DOWN[0], { shiftKey: true });

      getDiagramJS().invoke(function(selection, keyboard) {

        // given
        createShapes();
        selection.select(shape1);
        selection.select(shape2, true);

        // when
        keyboard._keyHandler(keyDownEvent);

        // then
        expect(shape1.x).to.eql(10);
        expect(shape1.y).to.eql(10 + CUSTOM_HIGH_SPEED);
        expect(shape2.x).to.eql(150);
        expect(shape2.y).to.eql(10 + CUSTOM_HIGH_SPEED);

      });

    });

  });

});


// helpers ////////

function createShapes() {

  getDiagramJS().invoke(function(canvas) {

    // given
    shape1 = canvas.addShape({
      id: 'shape1',
      x: 10,
      y: 10,
      width: 100,
      height: 100
    });

    shape2 = canvas.addShape({
      id: 'shape2',
      x: 150,
      y: 10,
      width: 100,
      height: 100
    });

  });

}
