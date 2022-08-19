import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import handToolModule from 'lib/features/hand-tool';
import draggingModule from 'lib/features/dragging';
import keyboardModule from 'lib/features/keyboard';

import { createKeyEvent } from 'test/util/KeyEvents';

import {
  assign
} from 'min-dash';

import { isMac } from 'lib/util/Platform';

var keyModifier = isMac() ? { metaKey: true } : { ctrlKey: true };


describe('features/hand-tool', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      handToolModule,
      draggingModule,
      keyboardModule
    ]
  }));

  var rootShape, childShape;

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));

  beforeEach(inject(function(canvas, elementFactory) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape, rootShape);
  }));


  describe('#toggle', function() {

    it('should activate and deactivate', inject(function(handTool) {

      // given
      handTool.toggle();

      // assume
      expect(handTool.isActive()).to.be.true;

      // when
      handTool.toggle();

      // then
      expect(handTool.isActive()).not.to.be.ok;
    }));

  });


  describe('behavior', function() {

    it('should not move element', inject(function(handTool, dragging) {

      // given
      var position = {
        x: childShape.x,
        y: childShape.y
      };

      // when
      handTool.activateMove(canvasEvent({ x: 150, y: 150 }));

      dragging.move(canvasEvent({ x: 300, y: 300 }));
      dragging.end();


      // then
      expect(childShape.x).to.equal(position.x);
      expect(childShape.y).to.equal(position.y);
    }));

  });


  describe('activate on mouse', function() {

    it('should start on PRIMARY mousedown', inject(function(handTool, eventBus) {

      // when
      eventBus.fire(mouseDownEvent(rootShape, keyModifier));

      // then
      expect(handTool.isActive()).to.be.true;
    }));


    it('should NOT start on AUXILIARY mousedown', inject(function(handTool, eventBus) {

      // when
      eventBus.fire(mouseDownEvent(rootShape, { button: 1, ctrlKey: false }));

      // then
      expect(handTool.isActive()).to.be.false;
    }));

  });


  describe('activate on space', function() {

    it('should activate on space key down', inject(function(eventBus, handTool) {

      // when
      eventBus.fire('keyboard.keydown', {
        keyEvent: createKeyEvent(' ')
      });

      // then
      expect(handTool.isActive()).to.be.true;
    }));


    it('should ignore non space down', inject(function(eventBus, handTool) {

      // when
      eventBus.fire('keyboard.keydown', {
        keyEvent: createKeyEvent('A')
      });

      // then
      expect(handTool.isActive()).not.to.be.ok;
    }));


    it('should deactivate on space key up (mousemove)', inject(function(eventBus, handTool) {

      // given
      eventBus.fire('keyboard.keydown', {
        keyEvent: createKeyEvent(' ')
      });

      // when
      eventBus.fire('keyboard.keyup', {
        keyEvent: createKeyEvent(' ')
      });

      // then
      expect(handTool.isActive()).not.to.be.ok;
    }));


    it('should ignore non space up', inject(function(eventBus, handTool) {

      // given
      eventBus.fire('keyboard.keydown', {
        keyEvent: createKeyEvent(' ')
      });

      // when
      eventBus.fire('keyboard.keyup', {
        keyEvent: createKeyEvent('A')
      });

      // then
      expect(handTool.isActive()).to.be.true;
    }));

  });

});


// helpers ////////////////

function mouseDownEvent(element, data) {

  return getDiagramJS().invoke(function(eventBus) {
    return eventBus.createEvent({
      type: 'element.mousedown',
      element: element,
      originalEvent: assign({ button: 0, clientX: 0, clientY: 0 }, data || { })
    });
  });
}