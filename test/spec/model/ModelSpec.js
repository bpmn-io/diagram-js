'use strict';

var Model = require('../../../lib/model');


describe('model', function() {


  it('should instantiate connection', function() {

    // given
    var waypoints = [ { x: 0, y: 0 }, { x: 100, y: 100 } ];

    // when
    var connection = Model.create('connection', {
      waypoints: waypoints
    });

    // then
    expect(connection.waypoints).to.equal(waypoints);

    expect(connection instanceof Model.Connection).to.equal(true);
  });


  it('should instantiate shape', function() {

    // given
    var x = 10, y = 20, width = 100, height = 100;

    // when
    var shape = Model.create('shape', {
      x: x,
      y: y,
      width: width,
      height: height
    });

    // then
    expect(shape.x).to.equal(x);
    expect(shape.y).to.equal(y);
    expect(shape.width).to.equal(width);
    expect(shape.height).to.equal(height);

    expect(shape instanceof Model.Shape).to.equal(true);
  });


  it('should wire relationships', function() {

    // when
    var parentShape = Model.create('shape');

    var shape1 = Model.create('shape', { parent: parentShape });
    var shape2 = Model.create('shape', { parent: parentShape });

    var shape1Label = Model.create('label', { parent: parentShape, labelTarget: shape1 });

    var connection = Model.create('connection', { parent: parentShape, source: shape1, target: shape2 });
    var connectionLabel = Model.create('label', { parent: parentShape, labelTarget: connection });

    // then

    // expect parent to be wired
    expect(parentShape.children).to.contain(shape1);
    expect(parentShape.children).to.contain(shape2);
    expect(parentShape.children).to.contain(shape1Label);
    expect(parentShape.children).to.contain(connection);
    expect(parentShape.children).to.contain(connectionLabel);

    // expect labels to be wired
    expect(shape1.label).to.equal(shape1Label);
    expect(connection.label).to.equal(connectionLabel);

    // expect outgoing / incoming to be wired
    expect(shape1.outgoing).to.contain(connection);
    expect(shape2.incoming).to.contain(connection);
  });


  describe('labels', function() {

    it('should set labelTarget', function() {

      // given
      var shape = Model.create('shape');

      // when
      var label = Model.create('label', { labelTarget: shape });

      // then
      expect(shape.label).to.equal(label);
      expect(shape.labels).to.eql([ label ]);
    });


    it('should set label', function() {

      // when
      var label = Model.create('label');

      // when
      var shape = Model.create('shape', { label: label });

      // then
      expect(shape.labels).to.eql([ label ]);

      expect(label.labelTarget).to.equal(shape);
    });


    it('should unset labelTarget', function() {

      // given
      var shape = Model.create('shape');

      var label = Model.create('label', { labelTarget: shape });

      // when
      label.labelTarget = null;

      // then
      expect(shape.label).not.to.exist;
      expect(shape.labels).to.be.empty;
    });


    it('should unset label', function() {

      // given
      var shape = Model.create('shape');

      var label = Model.create('label', { labelTarget: shape });

      // when
      shape.label = null;

      // then
      expect(shape.labels).to.eql([ ]);

      expect(label.labelTarget).not.to.exist;
    });

  });


  it('should wire multi label to relationship', function() {

    //when
    var parentShape = Model.create('shape');

    var shape1 = Model.create('shape', { parent: parentShape });
    var shape2 = Model.create('shape', { parent: parentShape });

    var shape1Label = Model.create('label', { parent: parentShape, labelTarget: shape1 });

    var connection = Model.create('connection', { parent: parentShape, source: shape1, target: shape2 });
    var connectionLabel1 = Model.create('label', { parent: parentShape, labelTarget: connection });
    var connectionLabel2 = Model.create('label', { parent: parentShape, labelTarget: connection });
    var connectionLabel3 = Model.create('label', { parent: parentShape, labelTarget: connection });

    //then

    // expect parent to be wired
    expect(parentShape.children).to.contain(shape1);
    expect(parentShape.children).to.contain(shape2);
    expect(parentShape.children).to.contain(shape1Label);
    expect(parentShape.children).to.contain(connection);
    expect(parentShape.children).to.contain(connectionLabel1);

    // expect labels to be wired
    expect(shape1.label).to.equal(shape1Label);
    expect(connection.labels).to.contain(connectionLabel1);
    expect(connection.labels).to.contain(connectionLabel2);
    expect(connection.labels).to.contain(connectionLabel3);

    // expect outgoing / incoming to be wired
    expect(shape1.outgoing).to.contain(connection);
    expect(shape2.incoming).to.contain(connection);

  });

});
