import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import { pick } from 'min-dash';

import attachSupportModule from 'lib/features/attach-support';
import labelSupportModule from 'lib/features/label-support';
import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';
import replaceModule from 'lib/features/replace';
import spaceToolModule from 'lib/features/space-tool';
import rulesModule from './rules';

import { getNewAttachShapeDelta } from 'lib/util/AttachUtil';

import { query as domQuery } from 'min-dom';

import { classes as svgClasses } from 'tiny-svg';

var ATTACH = { attach: true };
var NO_ATTACH = { attach: false };


describe('features/attach-support', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      attachSupportModule,
      labelSupportModule,
      moveModule,
      modelingModule,
      replaceModule,
      rulesModule,
      spaceToolModule
    ]
  }));


  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));

  afterEach(inject(function(dragging) {
    dragging.setOptions({ manual: false });
  }));


  var rootShape,
      parentShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);
  }));


  describe('modeling', function() {

    var host, attacher, attacher2;

    beforeEach(inject(function(canvas, elementFactory, modeling) {

      host = elementFactory.createShape({
        id: 'host',
        x: 700, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(host, rootShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        x: 400, y: 110,
        width: 50, height: 50
      });

      modeling.createShape(attacher, { x: 400, y: 110 }, parentShape, ATTACH);


      attacher2 = elementFactory.createShape({
        id: 'attacher2',
        x: 425, y: 375,
        width: 50, height: 50
      });

      canvas.addShape(attacher2, rootShape);
    }));


    it('should attach', inject(function(modeling) {

      // when
      modeling.moveElements([ attacher2 ], { x: -50, y: 0 }, parentShape, ATTACH);

      // then
      expect(attacher2.host).to.equal(parentShape);
      expect(parentShape.attachers).to.include(attacher2);
    }));


    it('should detach from host', inject(function(modeling) {

      // when
      modeling.moveElements([ attacher ], { x: 50, y: 50 }, rootShape, NO_ATTACH);

      // then
      expect(attacher.host).not.to.exist;
      expect(parentShape.attachers).not.to.include(attacher);
    }));


    it('should reattach to original host on undo', inject(function(modeling, commandStack) {

      // when
      modeling.moveElements([ attacher ], { x: 50, y: 50 }, rootShape, NO_ATTACH);

      commandStack.undo();

      // then
      expect(attacher.host).to.equal(parentShape);
      expect(parentShape.attachers).to.include(attacher);
    }));


    it('should detach on undo', inject(function(modeling, commandStack) {

      // when
      modeling.moveElements([ attacher2 ], { x: -50, y: 0 }, parentShape, ATTACH);

      commandStack.undo();

      // then
      expect(attacher2.host).not.to.exist;
      expect(parentShape.attachers).not.to.include(attacher2);
    }));


    it('should reattach to initial host when detached', inject(function(modeling) {

      // when
      modeling.moveElements([ attacher ], { x: 50, y: 50 }, rootShape, NO_ATTACH);

      modeling.moveElements([ attacher ], { x: -50, y: -50 }, parentShape, ATTACH);

      // then
      expect(attacher.host).to.equal(parentShape);
      expect(parentShape.attachers).to.include(attacher);
    }));


    it('should reattach to another host', inject(function(modeling) {

      // when
      modeling.moveElements([ attacher ], { x: 300, y: 0 }, host, ATTACH);

      // then
      expect(attacher.host).to.equal(host);
      expect(host.attachers).to.include(attacher);
    }));


    it('should detach on reattachment undo', inject(function(modeling, commandStack) {

      // when
      modeling.moveElements([ attacher ], { x: 50, y: 50 }, rootShape, NO_ATTACH);

      modeling.moveElements([ attacher ], { x: -50, y: -50 }, parentShape, ATTACH);

      commandStack.undo();

      // then
      expect(attacher.host).not.to.exist;
      expect(parentShape.attachers).not.to.include(attacher);
    }));


    it('should move with closure', inject(function(modeling, eventBus) {

      // given
      var listener = sinon.spy(function(event) {

        var closure = event.context.closure;

        // attacher is part of closure
        expect(closure.allShapes).to.contain.key(attacher.id);

        // attacher did move with closure
        expect(attacher).to.have.position({
          x: 400 - 25 - 50,
          y: 110 - 25
        });
      });

      eventBus.once('commandStack.elements.move.postExecuted', 5000, listener);

      // when
      modeling.moveElements([ parentShape ], { x: -50, y: 0 });

      // then
      expect(listener).to.have.been.called;
    }));

  });


  describe('move', function() {

    var host, host2, attacher, attacher2;

    beforeEach(inject(function(canvas, elementFactory) {
      host = elementFactory.createShape({
        id: 'host',
        x: 500, y: 100, width: 100, height: 100
      });

      canvas.addShape(host, rootShape);

      host2 = elementFactory.createShape({
        id: 'host2',
        x: 200, y: 250, width: 100, height: 100
      });

      canvas.addShape(host2, parentShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        host: host,
        x: 575, y: 75, width: 50, height: 50
      });

      canvas.addShape(attacher, rootShape);

      attacher2 = elementFactory.createShape({
        id: 'attacher2',
        host: host,
        x: 575, y: 175, width: 50, height: 50
      });

      canvas.addShape(attacher2, rootShape);
    }));


    it('should move attachers along with host', inject(function(move, dragging, elementRegistry) {

      // given
      var rootGfx = elementRegistry.getGraphics(rootShape);

      // when
      move.start(canvasEvent({ x: 550, y: 150 }), host);

      dragging.hover({
        element: rootShape,
        gfx: rootGfx
      });

      dragging.move(canvasEvent({ x: 700, y: 300 }));
      dragging.end();

      // then
      expect(attacher.x).to.equal(725);
      expect(attacher.y).to.equal(225);

      expect(attacher.host).to.eql(host);
      expect(host.attachers).to.include(attacher);

      expect(attacher2.x).to.equal(725);
      expect(attacher2.y).to.equal(325);

      expect(attacher2.host).to.equal(host);
      expect(host.attachers).to.include(attacher2);
    }));


    it('should move attachers along with NEW host', inject(
      function(move, dragging, elementRegistry) {

        // given
        var host2Gfx = elementRegistry.getGraphics(host2),
            parentGfx = elementRegistry.getGraphics(parentShape);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: host2,
          gfx: host2Gfx
        });

        dragging.move(canvasEvent({ x: 225, y: 275 }));
        dragging.end();

        move.start(canvasEvent({ x: 250, y: 300 }), host2);

        dragging.hover({
          element: parentShape,
          gfx: parentGfx
        });

        dragging.move(canvasEvent({ x: 300, y: 300 }));
        dragging.end();

        // then
        expect(attacher.x).to.equal(225);
        expect(attacher.y).to.equal(225);

        expect(attacher.host).to.eql(host2);
        expect(host2.attachers).to.include(attacher);
      }
    ));


    it('should move attachers along with host to new parent', inject(
      function(move, dragging, elementRegistry, modeling) {

        // given
        var host2Gfx = elementRegistry.getGraphics(host2);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: host2,
          gfx: host2Gfx
        });

        dragging.move(canvasEvent({ x: 225, y: 275 }));
        dragging.end();

        modeling.moveElements([ host2 ], { x: 300, y: 50 }, rootShape);

        // then
        expect(host2.parent).to.equal(rootShape);
        expect(attacher.parent).to.equal(rootShape);

        expect(rootShape.children).to.include(host2);
        expect(rootShape.children).to.include(attacher);

        expect(rootShape.children.indexOf(attacher)).to.be.above(rootShape.children.indexOf(host2));
      }
    ));


    it('should move attachers along with host selection', inject(
      function(move, dragging, elementRegistry, selection) {

        // given
        var rootGfx = elementRegistry.getGraphics(rootShape);

        selection.select([ host, attacher, attacher2 ]);

        // when
        move.start(canvasEvent({ x: 550, y: 150 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 700, y: 300 }));
        dragging.end();

        // then
        expect(attacher.x).to.equal(725);
        expect(attacher.y).to.equal(225);

        expect(attacher.host).to.eql(host);
        expect(host.attachers).to.include(attacher);

        expect(attacher2.x).to.equal(725);
        expect(attacher2.y).to.equal(325);

        expect(attacher2.host).to.equal(host);
        expect(host.attachers).to.include(attacher2);
      }
    ));


    it('should move attachers along with parent', inject(
      function(move, dragging, elementRegistry) {

        // given
        var rootGfx = elementRegistry.getGraphics(rootShape);
        var host2Gfx = elementRegistry.getGraphics(host2);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: host2,
          gfx: host2Gfx
        });

        dragging.move(canvasEvent({ x: 225, y: 275 }));
        dragging.end();

        // when
        move.start(canvasEvent({ x: 550, y: 150 }), parentShape);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 700, y: 300 }));
        dragging.end();

        // then
        expect(attacher.x).to.eql(325);
        expect(attacher.y).to.eql(375);

        expect(attacher.host).to.eql(host2);
        expect(host2.attachers).to.include(attacher);
      }
    ));


    it('should not move disallowed attacher', inject(
      function(move, dragging, elementRegistry) {

        // given
        var hostGfx = elementRegistry.getGraphics(host);

        // when
        move.start(canvasEvent({ x: 600, y: 200 }), attacher2);

        dragging.hover({
          element: host,
          gfx: hostGfx
        });

        dragging.move(canvasEvent({ x: 100, y: 100 }));

        // then
        expect(attacher2.x).to.equal(575);
        expect(attacher2.y).to.equal(175);
      }
    ));


    it('should detach attacher from host', inject(
      function(move, dragging, elementRegistry) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: parentShape,
          gfx: parentGfx
        });

        dragging.move(canvasEvent({ x: 425, y: 125 }));

        dragging.end();

        // then
        expect(attacher.host).not.to.exist;
        expect(attacher.parent).to.equal(parentShape);

        expect(parentShape.attachers).not.to.contain(attacher);

        expect(host.attachers).to.include(attacher2);
        expect(host.attachers).not.to.include(attacher);
      }
    ));


    it('should detach multiple attachers from host', inject(
      function(dragging, elementRegistry, move, selection) {

        // given
        var rootGfx = elementRegistry.getGraphics(rootShape);

        selection.select([ attacher, attacher2 ]);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 725, y: 125 }));

        dragging.end();

        // then
        expect(attacher.host).not.to.exist;
        expect(attacher.parent).to.equal(rootShape);

        expect(attacher2.host).not.to.exist;
        expect(attacher2.parent).to.equal(rootShape);

        expect(host.attachers).not.to.include(attacher);
        expect(host.attachers).not.to.include(attacher2);
      }
    ));


    it('should reattach to host -> detachment (undo)', inject(
      function(move, dragging, elementRegistry, commandStack) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: parentShape,
          gfx: parentGfx
        });

        dragging.move(canvasEvent({ x: 425, y: 125 }));
        dragging.end();

        commandStack.undo();

        // then
        expect(attacher.host).to.equal(host);
        expect(attacher.parent).to.equal(rootShape);

        expect(host.attachers).to.include(attacher);
      }
    ));


    it('should detach and reattach', inject(function(elementRegistry, move, dragging) {

      // given
      var parentGfx = elementRegistry.getGraphics(parentShape),
          hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(canvasEvent({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: parentShape,
        gfx: parentGfx
      });

      dragging.move(canvasEvent({ x: 425, y: 125 }));
      dragging.end();

      // then
      expect(attacher.host).not.to.exist;


      // but when ...
      move.start(canvasEvent({ x: 700, y: 275 }), attacher);

      dragging.hover({
        element: host,
        gfx: hostGfx
      });

      dragging.move(canvasEvent({ x: 625, y: 125 }));
      dragging.end();

      // then
      expect(attacher.host).to.exist;
      expect(attacher.parent).to.equal(rootShape);

      expect(host.attachers).to.include(attacher);
    }));


    it('should attach to another host', inject(function(elementRegistry, move, dragging) {

      // given
      var host2Gfx = elementRegistry.getGraphics(host2);

      // when
      move.start(canvasEvent({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(canvasEvent({ x: 225, y: 275 }));
      dragging.end();

      // then
      expect(attacher.host).to.equal(host2);
      expect(attacher.parent).to.equal(parentShape);
      expect(host2.attachers).to.include(attacher);
    }));


    it('should reattach to original host on undo', inject(
      function(elementRegistry, move, dragging, commandStack) {

        // given
        var host2Gfx = elementRegistry.getGraphics(host2);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: host2,
          gfx: host2Gfx
        });

        dragging.move(canvasEvent({ x: 225, y: 275 }));
        dragging.end();

        commandStack.undo();

        // then
        expect(attacher.host).to.equal(host);

        expect(attacher.parent).to.equal(rootShape);

        expect(host.attachers).to.include(attacher);
        expect(host2.attachers).not.to.include(attacher);
      }
    ));


    it('should attach to another host when moving with a label', inject(
      function(elementFactory, elementRegistry, modeling, move, dragging, selection) {

        // given
        var host2Gfx = elementRegistry.getGraphics(host2),
            label = elementFactory.createLabel({ width: 80, height: 40 });

        modeling.createLabel(attacher, { x: 600, y: 100 }, label, parentShape);

        selection.select([ attacher, label ]);

        // when
        move.start(canvasEvent({ x: 625, y: 125 }), attacher);

        dragging.hover({
          element: host2,
          gfx: host2Gfx
        });

        dragging.move(canvasEvent({ x: 225, y: 275 }));
        dragging.end();

        // then
        expect(attacher.host).to.equal(host2);
        expect(attacher.parent).to.equal(parentShape);
        expect(host2.attachers).to.include(attacher);
      }
    ));


    it('should remove invalid outgoing attacher connection', inject(
      function(elementFactory, elementRegistry, move, dragging, canvas) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        var element = elementFactory.createShape({
          id: 'element',
          x: 700, y: 50, width: 100, height: 100
        });

        canvas.addShape(element, rootShape);

        var connection = elementFactory.createConnection({
          id: 'connection',
          source: attacher,
          target: element,
          waypoints: [
            { x: 625, y: 100 },
            { x: 700, y: 100 }
          ]
        });

        canvas.addConnection(connection, rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: parentShape,
          gfx: parentGfx
        });

        dragging.move(canvasEvent({ x: 250, y: 150 }));
        dragging.end();

        // then
        expect(attacher.outgoing).to.be.empty;
      }
    ));


    it('should remove invalid outgoing attacher connections', inject(
      function(elementFactory, elementRegistry, move, dragging, canvas) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        var element = elementFactory.createShape({
          id: 'element',
          x: 700, y: 50, width: 100, height: 100
        });

        canvas.addShape(element, rootShape);

        var connection1 = elementFactory.createConnection({
          id: 'connection1',
          source: element,
          target: attacher,
          waypoints: [
            { x: 700, y: 100 },
            { x: 625, y: 100 }
          ]
        });

        canvas.addConnection(connection1, rootShape);

        var connection2 = elementFactory.createConnection({
          id: 'connection2',
          source: element,
          target: attacher,
          waypoints: [
            { x: 700, y: 100 },
            { x: 625, y: 100 }
          ]
        });

        canvas.addConnection(connection2, rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: parentShape,
          gfx: parentGfx
        });

        dragging.move(canvasEvent({ x: 250, y: 150 }));
        dragging.end();

        // then
        expect(attacher.outgoing).to.be.empty;
      }
    ));


    it('should remove invalid incoming attacher connection', inject(
      function(elementFactory, elementRegistry, move, dragging, canvas) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        var element = elementFactory.createShape({
          id: 'element',
          x: 700, y: 50, width: 100, height: 100
        });

        canvas.addShape(element, rootShape);

        var connection = elementFactory.createConnection({
          id: 'connection',
          source: element,
          target: attacher,
          waypoints: [
            { x: 700, y: 100 },
            { x: 625, y: 100 }
          ]
        });

        canvas.addConnection(connection, rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: parentShape,
          gfx: parentGfx
        });

        dragging.move(canvasEvent({ x: 250, y: 150 }));
        dragging.end();

        // then
        expect(attacher.incoming).to.be.empty;
      }
    ));


    it('should remove invalid incoming attacher connections', inject(
      function(elementFactory, elementRegistry, move, dragging, canvas) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        var element = elementFactory.createShape({
          id: 'element',
          x: 700, y: 50, width: 100, height: 100
        });

        canvas.addShape(element, rootShape);

        var connection1 = elementFactory.createConnection({
          id: 'connection1',
          source: element,
          target: attacher,
          waypoints: [
            { x: 700, y: 100 },
            { x: 625, y: 100 }
          ]
        });

        canvas.addConnection(connection1, rootShape);

        var connection2 = elementFactory.createConnection({
          id: 'connection2',
          source: element,
          target: attacher,
          waypoints: [
            { x: 700, y: 100 },
            { x: 625, y: 100 }
          ]
        });

        canvas.addConnection(connection2, rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: parentShape,
          gfx: parentGfx
        });

        dragging.move(canvasEvent({ x: 250, y: 150 }));
        dragging.end();

        // then
        expect(attacher.incoming).to.be.empty;
      }
    ));


    it('should not remove valid outgoing attacher connections', inject(
      function(elementFactory, elementRegistry, move, dragging, canvas) {

        // given
        var rootGfx = elementRegistry.getGraphics(rootShape);

        var element = elementFactory.createShape({
          id: 'element',
          x: 700, y: 50, width: 100, height: 100
        });

        canvas.addShape(element, rootShape);

        var connection = elementFactory.createConnection({
          id: 'connection',
          source: attacher,
          target: element,
          waypoints: [
            { x: 625, y: 100 },
            { x: 700, y: 100 }
          ]
        });

        canvas.addConnection(connection, rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 450, y: 150 }));
        dragging.end();

        // then
        expect(attacher.outgoing).to.include(connection);
      }
    ));


    it('should not remove valid incoming attacher connections', inject(
      function(elementFactory, elementRegistry, move, dragging, canvas) {

        // given
        var rootGfx = elementRegistry.getGraphics(rootShape);

        var element = elementFactory.createShape({
          id: 'element',
          x: 700, y: 50, width: 100, height: 100
        });

        canvas.addShape(element, rootShape);

        var connection = elementFactory.createConnection({
          id: 'connection',
          source: element,
          target: attacher,
          waypoints: [
            { x: 700, y: 100 },
            { x: 625, y: 100 }
          ]
        });

        canvas.addConnection(connection, rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 450, y: 150 }));
        dragging.end();

        // then
        expect(attacher.incoming).to.include(connection);
      }
    ));


    it('should move labels along with attachers when moving host', inject(
      function(elementFactory, elementRegistry, modeling, move, dragging) {

        // given
        var label = elementFactory.createLabel({ width: 80, height: 40 });

        modeling.createLabel(attacher, { x: 600, y: 100 }, label, rootShape);

        var rootGfx = elementRegistry.getGraphics(rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 600, y: 200 }));
        dragging.end();

        // then
        expect(label.x).to.equal(650);
        expect(label.y).to.equal(170);
      }
    ));


    it('should move multi labels along with attachers when moving host', inject(
      function(elementFactory, elementRegistry, modeling, move, dragging) {

        // given
        var label1 = elementFactory.createLabel({ width: 80, height: 40 });
        var label2 = elementFactory.createLabel({ width: 80, height: 40 });

        modeling.createLabel(attacher, { x: 600, y: 100 }, label1, rootShape);
        modeling.createLabel(attacher, { x: 600, y: 100 }, label2, rootShape);

        var rootGfx = elementRegistry.getGraphics(rootShape);

        // when
        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 600, y: 200 }));
        dragging.end();

        // then
        expect(label1.x).to.equal(650);
        expect(label1.y).to.equal(170);
        expect(label2.x).to.equal(650);
        expect(label2.y).to.equal(170);
      }
    ));


    it('should move labels along with attachers when moving selection', inject(
      function(elementFactory, elementRegistry, modeling, move, dragging, selection) {

        // given
        var label = elementFactory.createLabel({ width: 80, height: 40 });

        modeling.createLabel(attacher, { x: 600, y: 100 }, label, rootShape);

        var rootGfx = elementRegistry.getGraphics(rootShape);

        // when
        selection.select([ host, label ]);

        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 600, y: 200 }));
        dragging.end();

        // then
        expect(label.x).to.equal(650);
        expect(label.y).to.equal(170);
      }
    ));


    it('should move multi labels along with attachers when moving selection', inject(
      function(elementFactory, elementRegistry, modeling, move, dragging, selection) {

        // given
        var label1 = elementFactory.createLabel({ width: 80, height: 40 });
        var label2 = elementFactory.createLabel({ width: 80, height: 40 });

        modeling.createLabel(attacher, { x: 600, y: 100 }, label1, rootShape);
        modeling.createLabel(attacher, { x: 600, y: 100 }, label2, rootShape);

        var rootGfx = elementRegistry.getGraphics(rootShape);

        // when
        selection.select([ host, label1, label2 ]);

        move.start(canvasEvent({ x: host.x+10, y: host.y+10 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 600, y: 200 }));
        dragging.end();

        // then
        expect(label1.x).to.equal(650);
        expect(label1.y).to.equal(170);
        expect(label2.x).to.equal(650);
        expect(label2.y).to.equal(170);
      }
    ));

  });


  describe('replace', function() {

    var host, attacher;

    beforeEach(inject(function(canvas, modeling, elementFactory, elementRegistry) {

      host = elementFactory.createShape({
        id: 'host',
        x: 200, y: 200, width: 100, height: 100
      });

      canvas.addShape(host, parentShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        host: host,
        x: 175, y: 175, width: 50, height: 50
      });

      canvas.addShape(attacher, parentShape);
    }));


    it('should adopt children with attachments', inject(
      function(elementFactory, replace, elementRegistry, canvas) {

        // given
        var replacement = {
          id: 'replacement',
          width: 300,
          height: 300
        };

        // when
        var newShape = replace.replaceElement(parentShape, replacement);

        // then
        expect(newShape.children).to.include(attacher);
        expect(attacher.parent).to.equal(newShape);

        expect(host.attachers).to.include(attacher);
        expect(attacher.host).to.eql(host);
      }
    ));


    it('should update host after replacing attachment', inject(function(replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: 50,
        height: 50
      };

      // when
      var newShape = replace.replaceElement(attacher, replacement);

      // then
      expect(newShape.host).to.exist;
      expect(host.attachers).to.include(newShape);
      expect(newShape.host).to.eql(host);
    }));


    it('should remove attachments after replacing host', inject(
      function(rules, replace) {

        // given
        var replacement = {
          id: 'replacement',
          width: host.width,
          height: host.height
        };

        // when
        var newShape = replace.replaceElement(host, replacement);

        // then
        expect(newShape.attachers).not.to.include(attacher);
        expect(attacher.host).not.to.eql(newShape);
      }
    ));


    it('should retain attachments after replacing host if a rule exist', inject(function(replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: host.width,
        height: host.height,
        retainAttachmentIds: ['attacher']
      };

      // when
      var newShape = replace.replaceElement(host, replacement);

      // then
      expect(attacher).to.exist;
      expect(newShape.attachers).to.include(attacher);
      expect(attacher.host).to.eql(newShape);
    }));


    it('should retain a subset of attachments after replacing host if a rule exist', inject(
      function(replace, elementFactory, canvas) {

        // given
        var attacher2 = elementFactory.createShape({
          id: 'attacher2',
          x: 225, y: 175, width: 50, height: 50,
          host: host
        });

        canvas.addShape(attacher2, parentShape);

        var replacement = {
          id: 'replacement',
          width: host.width,
          height: host.height,
          retainAttachmentIds: ['attacher']
        };

        // when
        var newShape = replace.replaceElement(host, replacement);

        // then
        expect(attacher.host).to.eql(newShape);
        expect(newShape.attachers).to.include(attacher);

        expect(attacher2.host).not.to.eql(newShape);
        expect(newShape.attachers).not.to.include(attacher2);
      }
    ));


    it('should move an attachment on replace elements with different size/position', inject(
      function(modeling, elementFactory, canvas) {

        // given
        var replacement = {
          id: 'replacement',
          width: host.width + 50,
          height: host.height + 50,
          x: host.x + host.width / 2,
          y: host.y + host.height / 2,
          retainAttachmentIds: ['attacher']
        };

        // when
        modeling.replaceShape(host, replacement);

        // then
        expect(attacher.x).to.be.equal(150);
        expect(attacher.y).to.be.equal(150);
      }
    ));

  });


  describe('visuals', function() {

    var host, host2, attacher, attacher2, label;

    beforeEach(inject(function(canvas, modeling, elementFactory, elementRegistry) {
      host = elementFactory.createShape({
        id: 'host',
        x: 500, y: 100, width: 100, height: 100
      });

      canvas.addShape(host, rootShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        host: host,
        x: 575, y: 75, width: 50, height: 50
      });

      canvas.addShape(attacher, rootShape);

      attacher2 = elementFactory.createShape({
        id: 'attacher2',
        host: host,
        x: 600, y: 200, width: 50, height: 50
      });

      canvas.addShape(attacher2, rootShape);

      label = elementFactory.createLabel({ width: 80, height: 40 });

      modeling.createLabel(attacher, { x: 600, y: 100 }, label, rootShape);

      host2 = elementFactory.createShape({
        id: 'host2',
        x: 500, y: 300, width: 100, height: 100
      });

      canvas.addShape(host2, rootShape);
    }));


    it('should add attachment marker', inject(function(move, dragging, elementRegistry) {

      // given
      var hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(canvasEvent({ x: 800, y: 100 }), attacher);

      dragging.hover({
        element: host,
        gfx: hostGfx
      });

      dragging.move(canvasEvent({ x: 575, y: 75 }));

      var ctx = dragging.context();

      // then
      expect(ctx.data.context.canExecute).to.equal('attach');
      expect(svgClasses(elementRegistry.getGraphics(host)).has('attach-ok')).to.be.true;
    }));


    it('should add attachment marker on start', inject(function(move, dragging, elementRegistry) {

      // given
      var hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(canvasEvent({ x: 800, y: 100 }), attacher);
      dragging.move(canvasEvent({ x: 750, y: 100 }));

      // then
      expect(svgClasses(hostGfx).has('attach-ok')).to.be.true;
    }));


    it('should remove attachment marker', inject(function(move, dragging, elementRegistry) {

      // given
      var hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(canvasEvent({ x: 800, y: 100 }), attacher);

      dragging.hover({
        element: host,
        gfx: hostGfx
      });

      dragging.move(canvasEvent({ x: 575, y: 75 }));
      dragging.end();

      // then
      expect(svgClasses(elementRegistry.getGraphics(host)).has('attach-ok')).to.be.false;
    }));


    it('should add attachment labels to dragGroup',
      inject(function(move, dragging, elementRegistry, elementFactory, modeling) {

        // given
        var rootGfx = elementRegistry.getGraphics(rootShape);

        // when
        move.start(canvasEvent({ x: 800, y: 100 }), host);

        dragging.hover({
          element: rootShape,
          gfx: rootGfx
        });

        dragging.move(canvasEvent({ x: 850, y: 75 }));

        // then
        // expect the label to be included in the dragGroup
        var dragGroup = dragging.context().data.context.dragGroup;

        expect(domQuery('[data-element-id=' + label.id + ']', dragGroup)).to.exist;
      })
    );

  });


  describe('remove', function() {

    var child, connection, attachedShape, attachedShape2, attachedShape3, attachedShape4;

    beforeEach(inject(function(modeling, elementFactory, canvas) {

      child = elementFactory.createShape({
        id: 'child',
        x: 600, y: 75,
        width: 50, height: 50
      });

      canvas.addShape(child, rootShape);

      attachedShape = elementFactory.createShape({
        id: 'attachedShape',
        x: 75, y: 75, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape, rootShape);

      attachedShape2 = elementFactory.createShape({
        id: 'attachedShape2',
        x: 375, y: 75, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape2, rootShape);

      attachedShape3 = elementFactory.createShape({
        id: 'attachedShape3',
        x: 75, y: 375, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape3, rootShape);

      attachedShape4 = elementFactory.createShape({
        id: 'attachedShape4',
        x: 375, y: 375, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape4, rootShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: attachedShape2,
        target: child,
        waypoints: [
          { x: 400, y: 100 },
          { x: 625, y: 100 }
        ]
      });

      canvas.addConnection(connection, rootShape);
    }));


    describe('should remove attacher', function() {

      it('execute', inject(function(modeling) {

        // when
        modeling.removeShape(attachedShape);

        // then
        expect(parentShape.attachers).to.have.length(3);
      }));


      it('undo', inject(function(modeling, commandStack) {

        // when
        modeling.removeShape(attachedShape);

        commandStack.undo();

        // then
        expect(parentShape.attachers).to.include(attachedShape);
      }));

    });


    describe('should remove multiple attachers', function() {

      it('execute', inject(function(modeling) {

        // when
        modeling.removeElements([ attachedShape2 ]);
        modeling.removeElements([ attachedShape3 ]);

        // then
        expect(parentShape.attachers).to.eql([ attachedShape, attachedShape4 ]);
      }));


      it('undo', inject(function(commandStack, modeling) {

        // given
        var originalAttachers = parentShape.attachers.slice();

        modeling.removeElements([ attachedShape2 ]);
        modeling.removeElements([ attachedShape3 ]);

        // when
        commandStack.undo();
        commandStack.undo();

        // then
        expect(parentShape.attachers).to.eql(originalAttachers);
      }));


      it('redo', inject(function(commandStack, modeling) {

        // given
        modeling.removeElements([ attachedShape2 ]);
        modeling.removeElements([ attachedShape3 ]);

        commandStack.undo();
        commandStack.undo();

        // when
        commandStack.redo();
        commandStack.redo();

        // then
        expect(parentShape.attachers).to.eql([ attachedShape, attachedShape4 ]);
      }));

    });


    describe('should remove connections with attachers', function() {

      it('execute', inject(function(modeling) {

        // when
        modeling.removeShape(attachedShape2);

        // then
        expect(child.incoming).to.have.length(0);
      }));


      it('undo', inject(function(commandStack, modeling) {

        // given
        modeling.removeShape(attachedShape2);

        // when
        commandStack.undo();

        // then
        expect(child.incoming).to.have.length(1);
      }));

    });


    describe('should remove connections with host', function() {

      it('execute', inject(function(modeling) {

        // when
        modeling.removeShape(parentShape);

        // then
        expect(child.incoming).to.have.length(0);
      }));


      it('undo', inject(function(commandStack, modeling) {

        // given
        modeling.removeShape(parentShape);

        // when
        commandStack.undo();

        // then
        expect(child.incoming).to.have.length(1);
      }));

    });


    describe('should remove attachers with host', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // when
        modeling.removeShape(parentShape);

        // then
        var parent = elementRegistry.get('parent');

        var attacher = elementRegistry.get('attachedShape');

        var attacher2 = elementRegistry.get('attachedShape2');

        var attacher3 = elementRegistry.get('attachedShape3');

        var attacher4 = elementRegistry.get('attachedShape4');


        expect(parent).not.to.exist;

        expect(attacher).not.to.exist;
        expect(attacher2).not.to.exist;
        expect(attacher3).not.to.exist;
        expect(attacher4).not.to.exist;
      }));


      it('undo', inject(function(commandStack, modeling, elementRegistry) {

        // given
        modeling.removeShape(parentShape);

        // when
        commandStack.undo();

        // then
        var parent = elementRegistry.get('parent');

        var attacher = elementRegistry.get('attachedShape');

        var attacher2 = elementRegistry.get('attachedShape2');

        var attacher3 = elementRegistry.get('attachedShape3');

        var attacher4 = elementRegistry.get('attachedShape4');

        expect(parent).to.exist;
        expect(parent.attachers).to.eql([attacher, attacher2, attacher3, attacher4 ]);

        expect(attacher).to.exist;
        expect(attacher2).to.exist;
        expect(attacher3).to.exist;
        expect(attacher4).to.exist;
      }));


      it('redo', inject(function(commandStack, modeling, elementRegistry) {

        // given
        modeling.removeShape(parentShape);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var parent = elementRegistry.get('parent');

        var attacher = elementRegistry.get('attachedShape');

        var attacher2 = elementRegistry.get('attachedShape2');

        var attacher3 = elementRegistry.get('attachedShape3');

        var attacher4 = elementRegistry.get('attachedShape4');

        expect(parent).not.to.exist;

        expect(attacher).not.to.exist;
        expect(attacher2).not.to.exist;
        expect(attacher3).not.to.exist;
        expect(attacher4).not.to.exist;
      }));

    });

  });


  describe('create', function() {

    var hostShape;

    beforeEach(inject(function(canvas, elementFactory, modeling) {

      hostShape = elementFactory.createShape({
        id: 'childShape',
        x: 100, y: 100, width: 100, height: 100
      });

      modeling.createShape(hostShape, { x: 150, y: 150 }, canvas.getRootElement());
    }));


    describe('should wire host <-> attacher', function() {

      it('execute', inject(function(elementFactory, modeling) {

        // when
        var attachedShape = elementFactory.createShape({
          id: 'childShape2',
          x: 0, y: 0, width: 50, height: 50
        });

        modeling.createShape(attachedShape, { x: 225, y: 225 }, hostShape, ATTACH);

        // then
        expect(attachedShape.host).to.equal(hostShape);
        expect(hostShape.attachers).to.contain(attachedShape);

        expect(attachedShape.parent).to.equal(hostShape.parent);
      }));


      it('undo', inject(function(elementFactory, modeling, commandStack) {

        // given
        var attachedShape = elementFactory.createShape({
          id: 'childShape2',
          x: 0, y: 0, width: 50, height: 50
        });

        modeling.createShape(attachedShape, { x: 225, y: 225 }, hostShape, ATTACH);

        // when
        commandStack.undo();

        // then
        expect(attachedShape.host).to.equal(undefined);
        expect(hostShape.attachers).not.to.contain(attachedShape);

        expect(attachedShape.parent).not.to.exist;
      }));


      it('redo', inject(function(elementFactory, modeling, commandStack) {

        // given
        var attachedShape = elementFactory.createShape({
          id: 'childShape2',
          x: 0, y: 0, width: 50, height: 50
        });

        modeling.createShape(attachedShape, { x: 225, y: 225 }, hostShape, ATTACH);

        commandStack.undo();

        // when
        commandStack.redo();

        // then
        expect(attachedShape.host).to.equal(hostShape);
        expect(hostShape.attachers).to.contain(attachedShape);

        expect(attachedShape.parent).to.equal(hostShape.parent);
      }));

    });


    it('should create multiple attachers', inject(function(elementFactory, modeling) {

      // when
      var attacherShape1 = elementFactory.createShape({
        id: 'attacherShape1',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(attacherShape1, { x: 225, y: 225 }, hostShape, ATTACH);

      var attacherShape2 = elementFactory.createShape({
        id: 'attacherShape2',
        x: 0, y: 0, width: 50, height: 50
      });

      modeling.createShape(attacherShape2, { x: 125, y: 225 }, hostShape, ATTACH);

      // then
      expect(hostShape.attachers.slice()).to.eql([ attacherShape1, attacherShape2 ]);

    }));

  });


  describe('append', function() {

    var hostShape,
        sourceShape;

    beforeEach(inject(function(canvas, elementFactory, modeling) {

      sourceShape = elementFactory.createShape({
        id: 'sourceShape',
        width: 100, height: 100
      });

      modeling.createShape(sourceShape, { x: 150, y: 150 }, canvas.getRootElement());

      hostShape = elementFactory.createShape({
        id: 'hostShape',
        width: 100, height: 100
      });

      modeling.createShape(hostShape, { x: 350, y: 150 }, canvas.getRootElement());
    }));


    it('should attach and connect', inject(function(modeling) {

      // when
      var newShape = modeling.appendShape(
        sourceShape,
        { id: 'appended', width: 50, height: 50 },
        { x: 300, y: 150 },
        hostShape,
        { attach: true }
      );

      // then
      expect(newShape.host).to.equal(hostShape);
      expect(hostShape.attachers).to.eql([ newShape ]);

      expect(newShape.outgoing).to.eql(sourceShape.incoming);

      expect(newShape.parent).to.equal(hostShape.parent);
    }));


    it('should attach and connect with connection', inject(function(modeling) {

      // when
      var newShape = modeling.appendShape(
        sourceShape,
        { id: 'appended', width: 50, height: 50 },
        { x: 300, y: 150 },
        hostShape,
        {
          attach: true,
          connectionParent: rootShape,
          connection: {
            id: 'FOO'
          }
        }
      );

      // then
      var connection = newShape.incoming[0];

      expect(connection.id).to.eql('FOO');
      expect(connection.parent).to.eql(rootShape);
    }));

  });


  describe('resize', function() {

    var rootShape, host, attacher, cornerAttacher;

    beforeEach(inject(function(elementFactory, canvas) {

      host = elementFactory.createShape({
        id: 'host',
        resizable: true,
        x: 200, y: 50,
        width: 400, height: 400
      });

      canvas.addShape(host, rootShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        host: host,
        x: 250, y: 400,
        width: 100, height: 100
      });

      canvas.addShape(attacher, rootShape);

      cornerAttacher = elementFactory.createShape({
        id: 'cornerAttacher',
        host: host,
        x: 575, y: 425,
        width: 50, height: 50
      });

      canvas.addShape(cornerAttacher, rootShape);
    }));


    it('should move attachers after resize', inject(function(modeling) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition,
          delta;

      var oldBounds = {
        x: 200, y: 50,
        width: 400, height: 400
      };

      var newBounds = {
        x: 250, y: 50,
        width: 350, height: 350
      };

      delta = getNewAttachShapeDelta(attacher, oldBounds, newBounds);

      // when
      modeling.resizeShape(host, newBounds);

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql({
        x: oldPosition.x + delta.x,
        y: oldPosition.y + delta.y
      });
    }));


    it('should move attachers after resize (undo)', inject(function(modeling, commandStack) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition;

      var newBounds = {
        x: 250, y: 50,
        width: 350, height: 350
      };

      // when
      modeling.resizeShape(host, newBounds);

      commandStack.undo();

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql(oldPosition);
    }));


    it('should move attachers after resize (undo -> redo)', inject(function(modeling, commandStack) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition,
          delta;

      var oldBounds = {
        x: 200, y: 50,
        width: 400, height: 400
      };

      var newBounds = {
        x: 250, y: 50,
        width: 350, height: 350
      };

      delta = getNewAttachShapeDelta(attacher, oldBounds, newBounds);

      // when
      modeling.resizeShape(host, newBounds);

      commandStack.undo();
      commandStack.redo();

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql({
        x: oldPosition.x + delta.x,
        y: oldPosition.y + delta.y
      });
    }));


    it('should move attacher labels after resize', inject(function(elementFactory, modeling) {

      // given
      var delta,
          label = elementFactory.createLabel({ width: 80, height: 40 });

      modeling.createLabel(attacher, { x: 600, y: 100 }, label, parentShape);

      var oldLabelPosition = {
        x: label.x,
        y: label.y
      };

      var oldBounds = {
        x: 200, y: 50,
        width: 400, height: 400
      };

      var newBounds = {
        x: 250, y: 50,
        width: 350, height: 350
      };

      delta = getNewAttachShapeDelta(attacher, oldBounds, newBounds);

      // when
      modeling.resizeShape(host, newBounds);

      var newLabelPosition = {
        x: label.x,
        y: label.y
      };

      // then
      expect(newLabelPosition).to.eql({
        x: oldLabelPosition.x + delta.x,
        y: oldLabelPosition.y + delta.y
      });

    }));


    it('should not move attachers after resize (attachSupport=false)', inject(function(modeling) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition;

      var newBounds = {
        x: 250, y: 50,
        width: 350, height: 350
      };

      // when
      modeling.resizeShape(host, newBounds, null, { attachSupport: false });

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql(oldPosition);
    }));


    it('should not move attachment if not necessary', inject(function(modeling) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition;

      var newBounds = {
        x: 200, y: 50,
        width: 350, height: 400
      };

      // when
      modeling.resizeShape(host, newBounds, null);

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql(oldPosition);
    }));


    it('should move attachment if relevant edge was moved', inject(function(modeling) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition;

      var newBounds = {
        x: 200, y: 50,
        width: 400, height: 200
      };

      // when
      modeling.resizeShape(host, newBounds, null);

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql({ x: oldPosition.x, y: oldPosition.y - 200 });
    }));


    it('should move attachment if it is moved into host', inject(function(modeling) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition;

      var newBounds = {
        x: 200, y: 50,
        width: 400, height: 450
      };

      // when
      modeling.resizeShape(host, newBounds, null);

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql({ x: oldPosition.x, y: oldPosition.y + 50 });
    }));


    it('should move attachment only on axis where it is necessary', inject(function(modeling) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition;

      var newBounds = {
        x: 200, y: 50,
        width: 450, height: 450
      };

      // when
      modeling.resizeShape(host, newBounds, null);

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql({ x: oldPosition.x, y: oldPosition.y + 50 });
    }));


    it('should not move attachment it is unnecessary', inject(function(modeling) {

      // given
      var oldPosition = pick(attacher, [ 'x', 'y' ]),
          newPosition;

      var newBounds = {
        x: 200, y: 0,
        width: 450, height: 450
      };

      // when
      modeling.resizeShape(host, newBounds, null);

      newPosition = pick(attacher, [ 'x', 'y' ]);

      // then
      expect(newPosition).to.eql({ x: oldPosition.x, y: oldPosition.y });
    }));


    it('should move shape attached to corner', inject(
      function(modeling) {

        // given
        var oldPosition = pick(cornerAttacher, [ 'x', 'y' ]),
            newPosition;

        var newBounds = {
          x: 200, y: 50,
          width: 420, height: 420
        };

        // when
        modeling.resizeShape(host, newBounds, null);

        newPosition = pick(cornerAttacher, [ 'x', 'y' ]);

        // then
        expect(newPosition).to.eql({ x: oldPosition.x + 20, y: oldPosition.y + 20 });
      }
    ));
  });

});