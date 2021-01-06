import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import modelingModule from 'lib/features/modeling';
import globalConnectModule from 'lib/features/global-connect';
import rulesModule from './rules';


describe('features/global-connect-tool', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      globalConnectModule,
      rulesModule
    ]
  }));

  var rootShape, shapeAbleToStartConnection, shapeUnableToStartConnection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shapeAbleToStartConnection = elementFactory.createShape({
      id: 's1',
      x: 100, y: 100, width: 300, height: 300,
      canStartConnection: true
    });

    canvas.addShape(shapeAbleToStartConnection, rootShape);

    shapeUnableToStartConnection = elementFactory.createShape({
      id: 's2',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shapeUnableToStartConnection, rootShape);
  }));


  describe('#toggle', function() {

    it('should activate and deactivate', inject(function(globalConnect) {

      // given
      globalConnect.toggle();

      // assume
      expect(globalConnect.isActive()).to.be.true;

      // when
      globalConnect.toggle();

      // then
      expect(globalConnect.isActive()).not.to.be.ok;
    }));

  });


  describe('behavior', function() {

    it('should start connect if allowed', inject(function(eventBus, globalConnect, dragging) {

      // given
      var shape = shapeAbleToStartConnection;
      var connectSpy = sinon.spy(function(event) {
        expect(event.context).to.eql({
          start: shape,
          connectionStart: { x: 150, y: 130 }
        });
      });

      eventBus.once('connect.init', connectSpy);

      // when
      globalConnect.start(canvasEvent({ x: 0, y: 0 }));

      dragging.move(canvasEvent({ x: 150, y: 130 }));
      dragging.hover(canvasEvent({ x: 150, y: 130 }, { element: shape }));
      dragging.end(canvasEvent({ x: 0, y: 0 }));

      eventBus.fire('element.out', canvasEvent({ x: 99, y: 99 }, { element: shape }));

      // then
      expect(connectSpy).to.have.been.called;
    }));


    it('should NOT start connect if rejected', inject(function(eventBus, globalConnect, dragging) {

      // given
      var shape = shapeUnableToStartConnection;
      var connectSpy = sinon.spy();

      eventBus.once('connect.init', connectSpy);

      // when
      globalConnect.start(canvasEvent({ x: 0, y: 0 }));
      dragging.hover(canvasEvent({ x: 150, y: 150 }, { element: shape }));
      dragging.end(canvasEvent({ x: 0, y: 0 }));

      eventBus.fire('element.out', canvasEvent({ x: 99, y: 99 }, { element: shape }));

      // then
      expect(connectSpy).to.not.have.been.called;
    }));

  });

});
