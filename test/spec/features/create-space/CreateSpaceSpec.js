var TestHelper = require('../../../TestHelper'),
    Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */

var createSpace =require('../../../../lib/features/create-space');
var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move');
//    rulesModule = require('./rules');


describe('features/create-space - CreateSpace', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, moveModule, createSpace ] }));


  var rootShape, parentShape, parentShape2, parentShape3, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 500, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    parentShape2 = elementFactory.createShape({
      id: 'parent2',
      x: 400, y: 100, width: 15, height: 300
    });

    canvas.addShape(parentShape2, rootShape);

    parentShape3 = elementFactory.createShape({
      id: 'parent3',
      x: 900, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape3, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 510, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 600, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 550, y: 210 }, { x: 550, y: 250 }, { x: 650, y: 250 }, { x: 650, y: 210 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
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
        expect( !element.x || (element.x >= 400 || element.x <= 900) ).toBe(true);
      });

    }));


    iit('should move elements rightwards to create some space', inject(function(dragging, elementRegistry, createSpace) {
      //when
      dragging.activate(createEvent({ x: 410, y: 10 }), 'create-space');
      dragging.move(createEvent({ x: 600, y: 11 }));
      dragging.end();

      //then
      elementRegistry.filter(function(element){
        expect( !element.x || (element.x >= 600 || element.x <= 410) ).toBe(true);
      });
    }));

    iit('should move elements leftwards to create some space', inject(function(dragging, elementRegistry, createSpace) {
      //when
      dragging.activate(createEvent({ x: 710, y: 10 }), 'create-space');
      dragging.move(createEvent({ x: 510, y: 10 }));
      dragging.end();

      //then
      elementRegistry.filter(function(element){
        expect( !element.x || (element.x >= 710 || element.x <= 510) ).toBe(true);
      });
    }));



  });


});
