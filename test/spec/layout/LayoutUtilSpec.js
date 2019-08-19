import {
  filterRedundantWaypoints,
  getOrientation,
  getMid
} from 'lib/layout/LayoutUtil';


function rect(x, y, width, height) {
  return { x: x, y: y, width: width, height: height };
}


describe('layout/LayoutUtil', function() {

  describe('#getMid', function() {

    it('should return rectangle mid point', function() {

      // given
      var r = rect(100, 100, 100, 200);

      // then
      expect(getMid(r)).to.eql({ x: 150, y: 200 });
    });


    it('should return point mid point', function() {

      // given
      var point = { x: 100, y: 100 };

      // then
      expect(getMid(point)).to.eql(point);
    });

  });

  describe('#getOrientation', function() {

    // a rectangle 100,100 -> 200,200
    var a = rect(100, 100, 100, 100);


    it('should detect top', function() {

      // given
      var b = rect(100, 0, 100, 100);

      expect(getOrientation(b, a)).to.equal('top');
    });


    it('should detect top-right', function() {

      // given
      var b = rect(200, 0, 100, 100);

      expect(getOrientation(b, a)).to.equal('top-right');
    });


    it('should detect right', function() {

      // given
      var b = rect(200, 100, 100, 100);

      expect(getOrientation(b, a)).to.equal('right');
    });


    it('should detect bottom-right', function() {

      // given
      var b = rect(200, 200, 100, 100);

      expect(getOrientation(b, a)).to.equal('bottom-right');
    });


    it('should detect bottom', function() {

      // given
      var b = rect(100, 200, 100, 100);

      expect(getOrientation(b, a)).to.equal('bottom');
    });


    it('should detect bottom-left', function() {

      // given
      var b = rect(0, 200, 100, 100);

      expect(getOrientation(b, a)).to.equal('bottom-left');
    });


    it('should detect left', function() {

      // given
      var b = rect(0, 100, 100, 100);

      expect(getOrientation(b, a)).to.equal('left');
    });


    it('should detect top-left', function() {

      // given
      var b = rect(0, 0, 100, 100);

      expect(getOrientation(b, a)).to.equal('top-left');
    });


    it('should detect intersect', function() {

      // given
      var b = rect(120, 120, 100, 100);

      expect(getOrientation(b, a)).to.equal('intersect');
    });

  });


  describe('#filterRedundantWaypoints', function() {

    it('should remove points on line', function() {

      // given
      var points = [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
        { x: 25, y: 25 },
        { x: 50, y: 50 },
        { x: 50, y: 75 },
        { x: 50, y: 100 }
      ];

      // then
      expect(filterRedundantWaypoints(points)).to.deep.equal([
        { x: 0, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
        { x: 50, y: 50 },
        { x: 50, y: 100 }
      ]);
    });


    it('should remove equal points', function() {

      // given
      var points = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: 50, y: 50 },
        { x: 50, y: 50 },
        { x: 50, y: 100 }
      ];

      // then
      expect(filterRedundantWaypoints(points)).to.deep.equal([
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: 50, y: 50 },
        { x: 50, y: 100 }
      ]);
    });
  });

});
