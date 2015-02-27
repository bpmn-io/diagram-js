var TestHelper = require('../../../TestHelper'),
    Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */

var createSpace =require('../../../../lib/features/create-space'),
    modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move');
//    rulesModule = require('./rules');


describe('features/create-space - CreateSpace', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, moveModule, createSpace ] }));

  var rootShape, parentShape, parentShape2, parentShape3, parentShape4, parentShape5, parentShape6, parentShape7, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas, modeling, dragging) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 500, y: 100, width: 310, height: 150
    });

    canvas.addShape(parentShape, rootShape);

    parentShape2 = elementFactory.createShape({
      id: 'parent2',
      x: 400, y: 100, width: 15, height: 150
    });

    canvas.addShape(parentShape2, rootShape);

    parentShape3 = elementFactory.createShape({
      id: 'parent3',
      x: 900, y: 100, width: 60, height: 150
    });

    canvas.addShape(parentShape3, rootShape);

    parentShape4 = elementFactory.createShape({
      id: 'parent4',
      x: 100, y: 300, width: 60, height: 60
    });

    canvas.addShape(parentShape4, rootShape);

    parentShape5 = elementFactory.createShape({
      id: 'parent5',
      x: 200, y: 350, width: 60, height: 60
    });

    canvas.addShape(parentShape5, rootShape);

    parentShape6 = elementFactory.createShape({
      id: 'parent6',
      x: 300, y: 400, width: 60, height: 60
    });

    canvas.addShape(parentShape6, rootShape);

    parentShape7 = elementFactory.createShape({
      id: 'parent7',
      x: 500, y: 410, width: 60, height: 60
    });

    canvas.addShape(parentShape7, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 510, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 700, y: 110, width: 100, height: 100
    });

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);

    canvas.addShape(childShape2, parentShape);
    modeling.connect(parentShape, parentShape4);
    modeling.connect(parentShape, parentShape5);
    modeling.connect(parentShape, parentShape6);
    modeling.connect(parentShape, parentShape7);

  }));

  describe('create-space test',function(){

    var createEvent;

    beforeEach(inject(function(canvas) {
      createEvent = Events.scopedCreate(canvas);
    }));

    iit('should have elements in a defined space', inject(function(dragging, elementRegistry, createSpace) {
      //given

      //then
      elementRegistry.filter(function(element){
        expect( !element.x || element.x >= 400 || element.x <= 900 ).toBe(true);
      });

    }));

    iit('should move elements rightwards to create some space', inject(function(dragging, elementRegistry, createSpace) {
      //when
      dragging.activate(createEvent({ x: 410, y: 10 }), 'create-space');
      dragging.move(createEvent({ x: 600, y: 11 }));
      dragging.end();

      //then
      elementRegistry.filter(function(element){
        expect( !element.x || element.x >= 600 || element.x <= 410 ).toBe(true);
      });
    }));

    iit('should move elements then undo and finally have elements in the original place',
      inject(function(dragging, elementRegistry, createSpace, commandStack
    ) {
      //when
      dragging.activate(createEvent({ x: 400, y: 10 }), 'create-space');
      dragging.move(createEvent({ x: 900, y: 11 }));
      dragging.end();
      commandStack.undo();

      //then
      console.log(parentShape7);
      expect(parentShape7.x === 500 && parentShape7.y === 410).toBe(true);
    }));


    iit('should move elements leftwards to create some space', inject(function(dragging, elementRegistry, createSpace) {
      //when
      dragging.activate(createEvent({ x: 710, y: 10 }), 'create-space');
      dragging.move(createEvent({ x: 510, y: 10 }));
      dragging.end();

      //then
      elementRegistry.filter(function(element){
        expect( !element.x || element.x >= 710 || element.x <= 510 ).toBe(true);
      });
    }));

    iit('should move elements downwards to create some space', inject(function(dragging, elementRegistry, createSpace) {
      //when
      dragging.activate(createEvent({ x: 210, y: 210 }), 'create-space');
      dragging.move(createEvent({ x: 210, y: 310 }));
      dragging.end();

      //then
      elementRegistry.filter(function(element){
        expect( !element.y || element.y >= 310 || element.y <= 210 ).toBe(true);
      });
    }));

    iit('should move elements upwards to create some space', inject(function(dragging, elementRegistry, createSpace) {
      //when
      dragging.activate(createEvent({ x: 210, y: 410 }), 'create-space');
      dragging.move(createEvent({ x: 210, y: 310 }));
      dragging.end();

      //then
      elementRegistry.filter(function(element){
        expect( !element.y || element.y >= 410 || element.y <= 310 ).toBe(true);
      });
    }));

  });


});
