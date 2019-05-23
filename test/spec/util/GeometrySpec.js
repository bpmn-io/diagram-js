import {
  pointsOnLine,
  pointsAligned
} from 'lib/util/Geometry';


describe('util/Geometry', function() {

  describe('#pointsOnLine', function() {

    var p = { x: 0, y: 0 },
        q = { x: 100, y: 100 },
        z = { x: 5, y: 5 },
        zfuzz = { x: 5, y: 10 };

    it('should work', function() {

      expect(pointsOnLine(p, q, z)).to.be.true;
      expect(pointsOnLine(q, p, z)).to.be.true;
      expect(pointsOnLine(p, z, q)).to.be.true;

      // match fuzzy
      expect(pointsOnLine(q, p, zfuzz)).to.be.true;

      // match non-fuzzy
      expect(pointsOnLine(q, p, zfuzz, 0)).to.be.false;
    });


    it('should be null safe', function() {

      expect(pointsOnLine(p, q, null)).to.be.false;
      expect(pointsOnLine(p, null, z)).to.be.false;
      expect(pointsOnLine(null, q, z)).to.be.false;
    });

  });


  describe('#pointsAligned', function() {

    it('should return h for exact horizontal line', function() {

      // given
      var p0 = { x: 200, y: 200 },
          p1 = { x: 400, y: 200 };

      // then
      expect(pointsAligned(p0, p1)).to.equal('h');
    });


    it('should return h for horizontal line in alignment threshold',
      function() {

        // given
        var p0 = { x: 200, y: 200 },
            p1 = { x: 400, y: 202 },
            p2 = { x: 200, y: 200 },
            p3 = { x: 400, y: 198 };

        // then
        expect(pointsAligned(p0, p1)).to.equal('h');
        expect(pointsAligned(p2, p3)).to.equal('h');
      }
    );


    it('should return v for exact vertical line', function() {

      // given
      var p0 = { x: 200, y: 200 },
          p1 = { x: 200, y: 400 };

      // then
      expect(pointsAligned(p0, p1)).to.equal('v');
    });


    it('should return v for vertical line within alignment threshold',
      function() {

        // given
        var p0 = { x: 200, y: 200 },
            p1 = { x: 202, y: 400 },
            p2 = { x: 200, y: 200 },
            p3 = { x: 198, y: 400 };

        // then
        expect(pointsAligned(p0, p1)).to.equal('v');
        expect(pointsAligned(p2, p3)).to.equal('v');
      }
    );


    it('should return false for non-aligned line', function() {

      // given
      var p0 = { x: 200, y: 200 },
          p1 = { x: 400, y: 400 };

      // then
      expect(pointsAligned(p0, p1)).to.be.false;
    });


    it('should return false for horizontal line outside alignment threshold',
      function() {

        // given
        var p0 = { x: 200, y: 200 },
            p1 = { x: 400, y: 203 },
            p2 = { x: 200, y: 200 },
            p3 = { x: 400, y: 197 };

        // then
        expect(pointsAligned(p0, p1)).to.be.false;
        expect(pointsAligned(p2, p3)).to.be.false;
      }
    );


    it('should return false for vertical line outside alignment threshold',
      function() {

        // given
        var p0 = { x: 200, y: 200 },
            p1 = { x: 203, y: 400 },
            p2 = { x: 200, y: 200 },
            p3 = { x: 197, y: 400 };

        // then
        expect(pointsAligned(p0, p1)).to.be.false;
        expect(pointsAligned(p2, p3)).to.be.false;
      }
    );

  });

});
