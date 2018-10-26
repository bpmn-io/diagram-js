import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import { createKeyEvent } from 'test/util/KeyEvents';

import {
  assign,
  forEach
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import keyboardMoveModule from 'lib/navigation/keyboard-move';


describe('navigation/keyboard-move', function() {

  var defaultDiagramConfig = {
    modules: [
      modelingModule,
      keyboardMoveModule
    ],
    canvas: {
      deferUpdate: false
    }
  };

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram(defaultDiagramConfig));


    it('should bootstrap', inject(function(keyboardMove, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      expect(keyboardMove).not.to.be.null;
    }));

  });


  describe('arrow bindings', function() {

    var KEYS = {
      LEFT: [ 'ArrowLeft', 'Left' ],
      UP: [ 'ArrowUp', 'Up' ],
      RIGHT: [ 'ArrowRight', 'Right' ],
      DOWN: [ 'ArrowDown', 'Down' ],
    };

    beforeEach(bootstrapDiagram(defaultDiagramConfig));


    describe('with default config', function() {

      describe('with Ctrl/Cmd', function() {

        it('should not move when neither Ctrl nor Cmd is pressed down',
          inject(function(canvas, keyboard) {

            // given
            var event = createKeyEvent(KEYS.RIGHT[0], { ctrlKey: false, metaKey: false });

            // when
            keyboard._keyHandler(event);

            // then
            expect(canvas.viewbox().x).to.eql(0);
            expect(canvas.viewbox().y).to.eql(0);
          })
        );

      });


      describe('with Ctrl/Cmd', function() {

        var BASE_SPEED = 50,
            HIGH_SPEED = 200;

        describe('without shift', function() {

          var decisionTable = [
            {
              desc: 'move left',
              keys: KEYS.LEFT,
              x: -BASE_SPEED,
              y: 0
            },
            {
              desc: 'move right',
              keys: KEYS.RIGHT,
              x: BASE_SPEED,
              y: 0
            },
            {
              desc: 'move up',
              keys: KEYS.UP,
              x: 0,
              y: -BASE_SPEED
            },
            {
              desc: 'move down',
              keys: KEYS.DOWN,
              x: 0,
              y: BASE_SPEED
            }
          ];

          forEach(decisionTable, function(testCase) {

            forEach(testCase.keys, function(key) {

              it('should ' + testCase.desc + ' with CtrlKey', inject(function(canvas, keyboard) {

                // given
                var event = createKeyEvent(key, {
                  ctrlKey: true,
                  shiftKey: false
                });

                // when
                keyboard._keyHandler(event);

                // then
                expect(canvas.viewbox().x).to.eql(testCase.x);
                expect(canvas.viewbox().y).to.eql(testCase.y);
              }));


              it('should ' + testCase.desc + ' with CmdKey', inject(function(canvas, keyboard) {

                // given
                var event = createKeyEvent(key, {
                  metaKey: true,
                  shiftKey: false
                });

                // when
                keyboard._keyHandler(event);

                // then
                expect(canvas.viewbox().x).to.eql(testCase.x);
                expect(canvas.viewbox().y).to.eql(testCase.y);
              }));

            });

          });

        });

        describe('with shift', function() {

          var decisionTable = [
            {
              desc: 'move left',
              keys: KEYS.LEFT,
              x: -HIGH_SPEED,
              y: 0
            },
            {
              desc: 'move right',
              keys: KEYS.RIGHT,
              x: HIGH_SPEED,
              y: 0
            },
            {
              desc: 'move up',
              keys: KEYS.UP,
              x: 0,
              y: -HIGH_SPEED
            },
            {
              desc: 'move down',
              keys: KEYS.DOWN,
              x: 0,
              y: HIGH_SPEED
            },
          ];

          forEach(decisionTable, function(testCase) {

            forEach(testCase.keys, function(key) {

              it('should ' + testCase.desc, inject(function(canvas, keyboard) {

                // given
                var event = createKeyEvent(key, { ctrlKey: true, shiftKey: true });

                // when
                keyboard._keyHandler(event);

                // then
                expect(canvas.viewbox().x).to.eql(testCase.x);
                expect(canvas.viewbox().y).to.eql(testCase.y);
              }));

            });

          });

        });

      });

    });


    describe('with custom config', function() {

      it('should use custom speed', function() {

        // given
        var customConfig = {
          keyboardMove: {
            moveSpeed: 23
          }
        };

        bootstrapDiagram(assign({}, defaultDiagramConfig, customConfig))();

        var keyDownEvent = createKeyEvent(KEYS.DOWN[0], { ctrlKey: true });

        getDiagramJS().invoke(function(canvas, keyboard) {

          // when
          keyboard._keyHandler(keyDownEvent);

          // then
          expect(canvas.viewbox().x).to.eql(0);
          expect(canvas.viewbox().y).to.eql(23);

        });
      });


      it('should use custom modified speed', function() {

        // given
        var customConfig = {
          keyboardMove: {
            moveSpeedAccelerated: 1
          }
        };

        bootstrapDiagram(assign({}, defaultDiagramConfig, customConfig))();

        var keyDownEvent = createKeyEvent(KEYS.DOWN[0], { ctrlKey: true, shiftKey: true });

        getDiagramJS().invoke(function(canvas, keyboard) {

          // when
          keyboard._keyHandler(keyDownEvent);

          // then
          expect(canvas.viewbox().x).to.eql(0);
          expect(canvas.viewbox().y).to.eql(1);

        });
      });

    });

  });

});
