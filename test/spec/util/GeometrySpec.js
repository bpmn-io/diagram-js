import {
  pointsOnLine
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

});