import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  forEach
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import keyboardMoveSelectionModule from 'lib/features/keyboard-move-selection';

import { createKeyEvent } from 'test/util/KeyEvents';

var KEYS = {
  ArrowUp: 'up',
  Up: 'up',
  ArrowLeft: 'left',
  Left: 'left',
  ArrowRight: 'right',
  Right: 'right',
  ArrowDown: 'down',
  Down: 'down'
};

var shape1, shape2;


describe('features/keyboard-move-selection', function() {

  describe('default config', function() {

    var BASE_SPEED = 1;
    var ACCELERATED_SPEED = 10;


    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        keyboardMoveSelectionModule
      ],
      canvas: {
        deferUpdate: false
      }
    }));

    beforeEach(inject(setupShapes));


    describe('should default move without shift', function() {

      verifyMoves({ shiftKey: false }, BASE_SPEED);

    });


    describe('should move accelerated with shift', function() {

      verifyMoves({ shiftKey: true }, ACCELERATED_SPEED);

    });


    describe('should not move with control', function() {

      verifyMove({ ctrlKey: true }, 'left', 'ArrowLeft', { x: 0, y: 0 });

    });


    describe('should not move with meta', function() {

      verifyMove({ metaKey: true }, 'left', 'ArrowLeft', { x: 0, y: 0 });

    });

  });


  describe('custom config', function() {

    var CUSTOM_SPEED = 23;
    var CUSTOM_SPEED_ACCELERATED = 77;


    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        keyboardMoveSelectionModule
      ],
      canvas: {
        deferUpdate: false
      },
      keyboardMoveSelection: {
        moveSpeed: CUSTOM_SPEED,
        moveSpeedAccelerated: CUSTOM_SPEED_ACCELERATED
      }
    }));

    beforeEach(inject(setupShapes));


    describe('should move with custom speed', function() {

      verifyMove({ shiftKey: false }, 'left', 'ArrowLeft', { x: -CUSTOM_SPEED, y: 0 });

    });


    describe('should move with custom accelerated speed', function() {

      verifyMove({ shiftKey: true }, 'left', 'ArrowLeft', { x: -CUSTOM_SPEED_ACCELERATED, y: 0 });

    });

  });


  describe('api', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        keyboardMoveSelectionModule
      ],
      canvas: {
        deferUpdate: false
      }
    }));

    beforeEach(inject(setupShapes));


    it('should provide #moveSelection(direction, false)', inject(
      function(keyboardMoveSelection) {

        // when
        keyboardMoveSelection.moveSelection('down', false);

        // then
        expect(shape1.x).to.eql(10);
        expect(shape1.y).to.eql(10 + 1);
        expect(shape2.x).to.eql(150);
        expect(shape2.y).to.eql(10 + 1);
      }
    ));


    it('should provide #moveSelection(direction, true)', inject(
      function(keyboardMoveSelection) {

        // when
        keyboardMoveSelection.moveSelection('down', true);

        // then
        expect(shape1.x).to.eql(10);
        expect(shape1.y).to.eql(10 + 10);
        expect(shape2.x).to.eql(150);
        expect(shape2.y).to.eql(10 + 10);
      }
    ));

  });

});


// helpers ////////

function setupShapes(canvas, selection) {

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

  selection.select([
    shape1,
    shape2
  ]);
}


function delta(direction, speed) {

  switch (direction) {
  case 'left': return { x: -speed, y: 0 };
  case 'right': return { x: speed, y: 0 };
  case 'up': return { x: 0, y: -speed };
  case 'down': return { x: 0, y: speed };
  default: throw new Error('illegal direction');
  }

}


function verifyMove(modifier, direction, key, expectedDelta) {

  it('<' + key + '> --> ' + direction, inject(function(keyboard) {

    // given
    var event = createKeyEvent(key, modifier);

    // when
    keyboard._keyHandler(event);

    // then
    expect(shape1.x).to.eql(10 + expectedDelta.x);
    expect(shape1.y).to.eql(10 + expectedDelta.y);

    expect(shape2.x).to.eql(150 + expectedDelta.x);
    expect(shape2.y).to.eql(10 + expectedDelta.y);
  }));

}


function verifyMoves(modifier, speed, expectedDelta) {

  forEach(KEYS, function(direction, key) {

    var d = expectedDelta || delta(direction, speed);

    verifyMove(modifier, direction, key, d);

  });

}