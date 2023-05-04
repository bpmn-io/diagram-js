import {
  create,
  isModelElement
} from 'lib/model';

import {
  isConnection,
  isLabel,
  isRoot
} from '../../../lib/util/ModelUtil';

describe('model', function() {

  describe('#create', function() {

    it('should create connection', function() {

      // given
      var waypoints = [ { x: 0, y: 0 }, { x: 100, y: 100 } ];

      // when
      var connection = create('connection', {
        waypoints: waypoints
      });

      // then
      expect(connection.waypoints).to.equal(waypoints);

      expect(isConnection(connection)).to.be.true;
      expect(isModelElement(connection)).to.be.true;
    });


    it('should create label', function() {

      // given
      var shape = create('shape', {
        x: 10,
        y: 20,
        width: 100,
        height: 100
      });

      var x = 10, y = 20, width = 100, height = 100;

      // when
      var label = create('label', {
        x: x,
        y: y,
        width: width,
        height: height,
        labelTarget: shape
      });

      // then
      expect(label.labelTarget).to.equal(shape);

      expect(isLabel(label)).to.be.true;
      expect(isModelElement(label)).to.be.true;
    });


    it('should create root', function() {

      // given
      var x = 10, y = 20, width = 100, height = 100;

      // when
      var root = create('root', {
        x: x,
        y: y,
        width: width,
        height: height
      });

      // then
      expect(root.x).to.equal(x);
      expect(root.y).to.equal(y);
      expect(root.width).to.equal(width);
      expect(root.height).to.equal(height);

      expect(isRoot(root)).to.be.true;
      expect(isModelElement(root)).to.be.true;
    });


    it('should create shape', function() {

      // given
      var x = 10, y = 20, width = 100, height = 100;

      // when
      var shape = create('shape', {
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

      expect(isModelElement(shape)).to.be.true;
    });

  });


  describe('should wire relationships', function() {

    it('shape + connection', function() {

      // when
      var parentShape = create('shape', {});

      var shape1 = create('shape', { parent: parentShape });
      var shape2 = create('shape', { parent: parentShape });

      var shape1Label = create('label', { parent: parentShape, labelTarget: shape1 });

      var connection = create('connection', { parent: parentShape, source: shape1, target: shape2 });
      var connectionLabel = create('label', { parent: parentShape, labelTarget: connection });

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
        var shape = create('shape');

        // when
        var label = create('label', { labelTarget: shape });

        // then
        expect(shape.label).to.equal(label);
        expect(shape.labels).to.eql([ label ]);
      });


      it('should set label', function() {

        // when
        var label = create('label');

        // when
        var shape = create('shape', { label: label });

        // then
        expect(shape.labels).to.eql([ label ]);

        expect(label.labelTarget).to.equal(shape);
      });


      it('should unset labelTarget', function() {

        // given
        var shape = create('shape');

        var label = create('label', { labelTarget: shape });

        // when
        label.labelTarget = null;

        // then
        expect(shape.label).not.to.exist;
        expect(shape.labels).to.be.empty;
      });


      it('should unset label', function() {

        // given
        var shape = create('shape');

        var label = create('label', { labelTarget: shape });

        // when
        shape.label = null;

        // then
        expect(shape.labels).to.eql([ ]);

        expect(label.labelTarget).not.to.exist;
      });


      it('should wire multi label to relationship', function() {

        // when
        var parentShape = create('shape');

        var shape1 = create('shape', { parent: parentShape });
        var shape2 = create('shape', { parent: parentShape });

        var connection = create('connection', {
          parent: parentShape,
          source: shape1,
          target: shape2
        });

        var primaryLabel = create('label', {
          parent: parentShape
        });

        var label2 = create('label', {
          parent: parentShape,
          labelTarget: connection
        });

        label2.labelTarget = null;

        var label3 = create('label', {
          parent: parentShape,
          labelTarget: connection
        });

        connection.label = primaryLabel;

        // then

        // expect labels to be wired
        expect(connection.labels).to.eql([
          primaryLabel,
          label3
        ]);

      });

    });

  });

});
