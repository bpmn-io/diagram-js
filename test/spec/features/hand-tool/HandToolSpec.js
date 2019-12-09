import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import handToolModule from 'lib/features/hand-tool';
import draggingModule from 'lib/features/dragging';
import keyboardModule from 'lib/features/keyboard';

import { createKeyEvent } from 'test/util/KeyEvents';


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

  describe('general', function() {

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


  describe('activate on space', function() {

    var removeEventListenerSpy;

    beforeEach(inject(function(eventBus) {
      eventBus.fire('keyboard.keydown', {
        keyEvent: createKeyEvent(' ')
      });

      removeEventListenerSpy = sinon.spy(window, 'removeEventListener');
    }));

    afterEach(function() {
      removeEventListenerSpy.restore();
    });


    it('should activate on space key down', inject(function(handTool) {

      // when
      triggerMouseEvent('mousemove', window);

      // then
      expect(handTool.isActive()).to.be.true;
    }));


    it('should deactivate on space key up (mousemove)', inject(function(eventBus, handTool) {

      // given
      triggerMouseEvent('mousemove', window);

      // when
      eventBus.fire('keyboard.keyup', {
        keyEvent: createKeyEvent(' ')
      });

      // then
      expect(handTool.isActive()).to.be.false;

      expect(removeEventListenerSpy).to.have.been.called;
    }));


    it('should deactivate on space key up (NO mousemove)', inject(function(eventBus, handTool) {

      // when
      eventBus.fire('keyboard.keyup', {
        keyEvent: createKeyEvent(' ')
      });

      // then
      expect(handTool.isActive()).to.be.false;

      expect(removeEventListenerSpy).to.have.been.called;
    }));

  });

});

// helpers //////////

function triggerMouseEvent(type, node) {
  var event = document.createEvent('MouseEvent');

  event.initMouseEvent(type, true, true, window, 0, 0, 0, 100, 100, false, false, false, false, 0, null);

  return node.dispatchEvent(event);
}