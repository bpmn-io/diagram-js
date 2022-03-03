import {
  selfAndDirectChildren,
  selfAndAllChildren,
  getBBox,
  getClosure,
  getParents,
  isFrameElement
} from 'lib/util/Elements';


describe('util/Elements', function() {

  var shapeA = { id: 'a' };

  var shapeA0 = { id: 'a.0', parent: shapeA },
      shapeA1 = { id: 'a.1', parent: shapeA },
      shapeA2 = { id: 'a.2', parent: shapeA };

  shapeA.children = [
    shapeA0,
    shapeA1,
    shapeA2
  ];

  var shapeA10 = { id: 'a.1.0', parent: shapeA1 },
      shapeA11 = { id: 'a.1.1', parent: shapeA1 },
      shapeA20 = { id: 'a.2.0', parent: shapeA2 },
      shapeA21 = { id: 'a.2.1', parent: shapeA2 };

  shapeA1.children = [ shapeA10, shapeA11 ];
  shapeA2.children = [ shapeA20, shapeA21 ];

  var shapeA210 = { id: 'a.2.1.0', parent: shapeA21 };

  shapeA21.children = [ shapeA210 ];

  var shapeB = {
    id: 'b'
  };

  var shapeC = {
    id: 'c',
    children: [
      { id: 'c.0' },
      { id: 'c.1' }
    ],
    attachers: []
  };

  var attacher = {
    id: 'attacher',
    host: shapeC
  };

  shapeC.attachers.push(attacher);

  var shapeD = {
    id: 'd',
    children: [
      shapeA,
      shapeB,
      shapeC
    ]
  };

  var shapeE = {
    id: 'e',
    children: [
      shapeC
    ]
  };

  var connection1 = {
    id: 'connection1',
    source: shapeE,
    target: shapeB
  };

  shapeE.outgoing = [ connection1 ];
  shapeB.incoming = [ connection1 ];

  function ids(array) {
    return array.map(function(e) {
      return e.id;
    });
  }


  describe('selfAndDirectChildren', function() {

    it('should return self + children', function() {

      // given
      var a = shapeA;

      // when
      var result = selfAndDirectChildren([ shapeA ]);

      // then
      expect(result.length).to.equal(4);
      expect(result).to.eql([ a ].concat(a.children));
    });


    it('should return self (no children)', function() {

      // when
      var result = selfAndDirectChildren([ shapeB ]);

      // then
      expect(result.length).to.equal(1);
      expect(result).to.eql([ shapeB ]);
    });


    it('should return unique elements', function() {

      // given
      var a = shapeA,
          child = shapeA.children[1];

      // when
      var result = selfAndDirectChildren([ a, child ]);

      // then
      expect(result.length).to.equal(6);
      expect(ids(result)).to.eql(ids([ a ].concat(a.children).concat(child.children)));
    });
  });


  describe('selfAndAllChildren', function() {

    it('should return self + ALL children', function() {

      // given
      var a = shapeA,
          d = shapeD; // parent of A

      // when
      var result = selfAndAllChildren([ a, d ]);

      // then
      expect(result.length).to.equal(14);
    });

  });


  describe('getClosure', function() {

    it('should work', function() {

      // when
      var closure = getClosure([ shapeB, shapeE ]);

      // then
      expect(closure.allShapes).to.have.keys('b', 'e', 'c', 'c.0', 'c.1');
      expect(closure.allConnections).to.have.keys('connection1');
      expect(closure.enclosedElements).to.have.keys('b', 'e', 'connection1', 'c', 'c.0', 'c.1');
      expect(closure.topLevel).to.have.keys('e', 'b', 'connection1');

      expect(closure.topLevel['connection1']).to.eql([ connection1 ]);
    });


    it('should be extensible', function() {

      // when
      var closure = getClosure([ shapeB, shapeE ], false, {
        topLevel: {
          'foo': []
        }
      });

      // then
      expect(closure.allShapes).to.have.keys('b', 'e', 'c', 'c.0', 'c.1');
      expect(closure.allConnections).to.have.keys('connection1');
      expect(closure.enclosedElements).to.have.keys('b', 'e', 'connection1', 'c', 'c.0', 'c.1');
      expect(closure.topLevel).to.have.keys('foo');
    });

  });


  describe('#getBBox', function() {

    var shape1 = {
      id: 'shape1',
      x: 100,
      y: 100,
      height: 10,
      width: 10
    };

    var shape2 = {
      id: 'shape2',
      x: 120,
      y: 100,
      height: 30,
      width:  40
    };

    var shape3 = {
      id: 'shape3',
      x: -10,
      y: -10,
      height: 20,
      width:  20
    };

    var connection1 = {
      id: 'connection1',
      waypoints: [ { x: 110, y: 105 }, { x: 120, y: 115 } ]
    };


    it('should return bbox for element', function() {

      // given
      var elements = shape2;

      // when
      var bbox = getBBox(elements);

      // then
      expect(bbox).to.eql({
        x: 120,
        y: 100,
        height: 30,
        width:  40
      });
    });

    it('should return bbox for connection', function() {

      // given
      var elements = connection1;

      // when
      var bbox = getBBox(elements);

      // then
      expect(bbox).to.eql({
        x: 110,
        y: 105,
        height: 10,
        width:  10
      });
    });

    it('should return bbox for elements', function() {

      // given
      var elements = [ shape1, shape2, connection1 ];

      // when
      var bbox = getBBox(elements);

      // then
      expect(bbox).to.eql({
        x: 100,
        y: 100,
        height: 30,
        width:  60
      });
    });

    it('should return bbox for elements at negative x,y', function() {

      // given
      var elements = [ shape1, shape2, shape3, connection1 ];

      // when
      var bbox = getBBox(elements);

      // then
      expect(bbox).to.eql({
        x: -10,
        y: -10,
        height: 140,
        width:  170
      });
    });

    it('should return bbox for elements with a connection at the bbox border', function() {

      // given
      var elements = [ shape1, connection1 ];

      // when
      var bbox = getBBox(elements);

      // then
      expect(bbox).to.eql({
        x: 100,
        y: 100,
        height: 15,
        width:  20
      });

    });

  });


  describe('#isFrameElement', function() {

    it('should return true for frame element', function() {

      // given
      var shape = {
        id: 'a',
        isFrame: true
      };

      // when
      var isFrame = isFrameElement(shape);

      // then
      expect(isFrame).to.be.true;
    });


    it('should return false for normal element', function() {

      // given
      var shape = {
        id: 'a'
      };

      // when
      var isFrame = isFrameElement(shape);

      // then
      expect(isFrame).to.be.false;
    });

  });


  describe('#getParents', function() {

    it('should get parents', function() {

      // when
      var parents = getParents([
        shapeA,
        shapeB,
        shapeA0,
        shapeA1,
        shapeA2,
        shapeA10,
        shapeA11,
        shapeA20,
        shapeA21,
        shapeA210
      ]);

      // then
      expect(parents).to.eql([
        shapeA,
        shapeB
      ]);
    });

  });


});
