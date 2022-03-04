import {
  connectRectangles,
  connectPoints,
  repairConnection
} from 'lib/layout/ManhattanLayout';


function point(x, y) {
  return { x: x, y: y };
}

function rect(x, y, width, height) {
  return { x: x, y: y, width: width, height: height };
}


function expectConnection(connection, expected) {

  var len = Math.max(connection.length, expected.length);

  for (var i = 0; i < len; i++) {
    expect(connection[i]).to.eql(expected[i]);
  }
}

function expectConnectionWaypoints(a, b, directions, waypoints) {
  return function() {
    var connection = connectPoints(a, b, directions);

    // expect
    expectConnection(connection, waypoints);
  };
}

describe('layout/ManhattanLayout', function() {

  describe('#connectPoints', function() {

    var a = point(100, 100),
        b = point(200, 200);


    /**
     * x----x
     *      |
     *      |
     *      x
     */
    describe('manhattan connection with 3 waypoints', function() {

      var waypoints = [ a, point(200, 100), b ];


      it('h:v', expectConnectionWaypoints(a, b, 'h:v', waypoints));
      it('r:v', expectConnectionWaypoints(a, b, 'r:v', waypoints));
      it('r:t', expectConnectionWaypoints(a, b, 'r:t', waypoints));
      it('h:t', expectConnectionWaypoints(a, b, 'h:t', waypoints));
    });


    /**
     * x
     * |
     * |
     * x----x
     */
    describe('manhattan connection with 3 waypoints', function() {

      var waypoints = [ a, point(100, 200), b ];


      it('v:h', expectConnectionWaypoints(a, b, 'v:h', waypoints));
      it('b:h', expectConnectionWaypoints(a, b, 'b:h', waypoints));
      it('b:l', expectConnectionWaypoints(a, b, 'b:l', waypoints));
      it('v:l', expectConnectionWaypoints(a, b, 'v:l', waypoints));
    });


    /**
     * x--x
     *    |
     *    |
     *    x--x
     */
    describe('manhattan connection with 4 waypoints', function() {

      var waypoints = [ a, point(150, 100), point(150, 200), b ];


      it('h:h', expectConnectionWaypoints(a, b, 'h:h', waypoints));
      it('r:h', expectConnectionWaypoints(a, b, 'r:h', waypoints));
      it('r:l', expectConnectionWaypoints(a, b, 'r:l', waypoints));
      it('h:l', expectConnectionWaypoints(a, b, 'h:l', waypoints));
    });


    /**
     * x----x
     *      |
     *      |
     *    x-x
     */
    describe('manhattan connection with 4 waypoints', function() {

      var waypoints = [ a, point(220, 100), point(220, 200), b ];


      it('h:r', expectConnectionWaypoints(a, b, 'h:r', waypoints));
      it('r:r', expectConnectionWaypoints(a, b, 'r:r', waypoints));
    });


    /**
     * x-x
     * |
     * |
     * x----x
     */
    describe('manhattan connection with 4 waypoints', function() {

      var waypoints = [ a, point(80, 100), point(80, 200), b ];


      it('l:h', expectConnectionWaypoints(a, b, 'l:h', waypoints));
      it('l:l', expectConnectionWaypoints(a, b, 'l:l', waypoints));
    });


    /**
     * x--x
     * |  |
     * x  |
     *    |
     *    x--x
     */
    describe('manhattan connection with 5 waypoints', function() {

      var waypoints = [ a, point(100, 80), point(150, 80), point(150, 200), b ];


      it('t:h', expectConnectionWaypoints(a, b, 't:h', waypoints));
      it('t:l', expectConnectionWaypoints(a, b, 't:l', waypoints));
    });


    /**
     * x--x
     *    |
     *    |  x
     *    |  |
     *    x--x
     */
    describe('manhattan connection with 5 waypoints', function() {

      var waypoints = [ a, point(150, 100), point(150, 220), point(200, 220), b ];


      it('h:b', expectConnectionWaypoints(a, b, 'h:b', waypoints));
      it('r:b', expectConnectionWaypoints(a, b, 'r:b', waypoints));
    });


    /**
     * x-x
     * |
     * x----x
     *      |
     *    x-x
     */
    describe('manhattan connection with 6 waypoints', function() {

      var waypoints = [ a, point(80, 100), point(80, 150), point(220, 150), point(220, 200), b ];


      it('l:r', expectConnectionWaypoints(a, b, 'l:r', waypoints));
    });


    /**
     * x--x
     * |  |
     * x  |  x
     *    |  |
     *    x--x
     */
    describe('manhattan connection with 6 waypoints', function() {

      var waypoints = [ a, point(100, 80), point(150, 80), point(150, 220), point(200, 220), b ];


      it('t:b', expectConnectionWaypoints(a, b, 't:b', waypoints));
    });


    describe('misc', function() {

      it('should not layout straight connection (h)', function() {

        // given
        var p0 = point(100, 100),
            p1 = point(200, 100);

        // when
        var connection = connectPoints(p0, p1);

        // then
        expectConnection(connection, [ p0, p1 ]);
      });


      it('should not layout straight connection (v)', function() {

        // given
        var p0 = point(100, 100),
            p1 = point(200, 100);

        // when
        var connection = connectPoints(p0, p1);

        // then
        expectConnection(connection, [ p0, p1 ]);
      });


      it('should reverse manhattan layout', function() {

        // given
        var p0 = point(200, 200),
            p1 = point(100, 100);

        // when
        var connection = connectPoints(p0, p1, 'v:v');

        // then
        expectConnection(connection, [ p0, point(200, 150), point(100, 150), p1 ]);
      });

    });


    describe('error handling', function() {

      it('should throw error on unknown directions', function() {

        expect(function() {
          connectPoints(a, b, 'x:y');
        }).to.throw(/unknown directions: <x:y>/);

      });

    });

  });


  describe('#connectRectangles', function() {

    var start = rect(100, 100, 100, 100);


    it('should connect top', function() {

      // given
      var end = rect(100, 0, 50, 50);

      // when
      var connection = connectRectangles(start, end);


      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 150, y: 100 },
        { x: 150, y: 75 },
        { x: 125, y: 75 },
        { original: { x: 125, y: 25 }, x: 125, y: 50 }
      ]);
    });


    it('should connect right', function() {

      // given
      var end = rect(250, 100, 50, 50);

      // when
      var connection = connectRectangles(start, end);

      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 200, y: 150 },
        { x: 225, y: 150 },
        { x: 225, y: 125 },
        { original: { x: 275, y: 125 }, x: 250, y: 125 }
      ]);
    });


    it('should connect left', function() {

      // given
      var end = rect(0, 100, 50, 50);

      // when
      var connection = connectRectangles(start, end);


      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 100, y: 150 },
        { x: 75, y: 150 },
        { x: 75, y: 125 },
        { original: { x: 25, y: 125 }, x: 50, y: 125 }
      ]);
    });


    it('should connect bottom', function() {

      // given
      var end = rect(100, 250, 50, 50);

      // when
      var connection = connectRectangles(start, end);

      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 150, y: 200 },
        { x: 150, y: 225 },
        { x: 125, y: 225 },
        { original: { x: 125, y: 275 }, x: 125, y: 250 }
      ]);
    });


    describe('tolerance', function() {

      it('should connect default v:v inside tolerance (preferred = default)', function() {

        // given
        var end = rect(210, 0, 50, 50);

        // when
        var connection = connectRectangles(start, end);

        // expect
        // still layouted v:v because h:h would look super ugly
        expectConnection(connection, [
          { original: { x: 150, y: 150 }, x: 150, y: 100 },
          { x: 150, y: 75 },
          { x: 235, y: 75 },
          { original: { x: 235, y: 25 }, x: 235, y: 50 }
        ]);
      });


      it('should connect h:h outside tolerance (preferred = default)', function() {

        // given
        var end = rect(230, 0, 50, 50);

        // when
        var connection = connectRectangles(start, end);

        // expect
        // layouted h:h
        expectConnection(connection, [
          { original: { x: 150, y: 150 }, x: 200, y: 150 },
          { x: 215, y: 150 },
          { x: 215, y: 25 },
          { original: { x: 255, y: 25 }, x: 230, y: 25 }
        ]);
      });


      it('should connect v:v inside tolerance (preferred = v:h)', function() {

        // given
        var end = rect(185, 0, 50, 50);

        // when
        var connection = connectRectangles(start, end, null, null, {
          preferredLayouts: [ 'v:h' ]
        });

        // expect
        // still layouted v:v due to tolerance
        expectConnection(connection, [
          { original: { x: 150, y: 150 }, x: 150, y: 100 },
          { x: 150, y: 75 },
          { x: 210, y: 75 },
          { original: { x: 210, y: 25 }, x: 210, y: 50 }
        ]);
      });


      it('should connect v:h outside tolerance (preferred = v:h)', function() {

        // given
        var end = rect(230, 0, 50, 50);

        // when
        var connection = connectRectangles(start, end, null, null, {
          preferredLayouts: [ 'v:h' ]
        });

        // expect
        // layouted v:h
        expectConnection(connection, [
          { original: { x: 150, y: 150 }, x: 150, y: 100 },
          { x: 150, y: 25 },
          { original: { x: 255, y: 25 }, x: 230, y: 25 }
        ]);
      });


      it('should connect h:v outside tolerance (preferred = h:v)', function() {

        // given
        var end = rect(230, 0, 50, 50);

        // when
        var connection = connectRectangles(start, end, null, null, {
          preferredLayouts: [ 'h:v' ]
        });

        // expect
        // layouted h:v
        expectConnection(connection, [
          { original: { x: 150, y: 150 }, x: 200, y: 150 },
          { x: 255, y: 150 },
          { original: { x: 255, y: 25 }, x: 255, y: 50 }
        ]);
      });

    });


    it('should connect top (directions = t:t)', function() {

      // given
      var end = rect(200, 100, 50, 50);

      // when
      var connection = connectRectangles(start, end, null, null, {
        preferredLayouts: [ 't:t' ]
      });


      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 150, y: 100 },
        { x: 150, y: 80 },
        { x: 225, y: 80 },
        { original: { x: 225, y: 125 }, x: 225, y: 100 }
      ]);
    });


    it('should connect top (directions = r:r)', function() {

      // given
      var end = rect(200, 100, 50, 50);

      // when
      var connection = connectRectangles(start, end, null, null, {
        preferredLayouts: [ 'r:r' ]
      });

      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 200, y: 150 },
        { x: 270, y: 150 },
        { x: 270, y: 125 },
        { original: { x: 225, y: 125 }, x: 250, y: 125 }
      ]);
    });


    it('should connection t:t by default when intersecting', function() {

      // given
      var end = rect(150, 100, 100, 100);

      // when
      var connection = connectRectangles(start, end);

      // expect
      expectConnection(connection, [
        { original: { x: 150, y: 150 }, x: 150, y: 100 },
        { x: 150, y: 80 },
        { x: 200, y: 80 },
        { original: { x: 200, y: 150 }, x: 200, y: 100 }
      ]);
    });

  });


  describe('#repairConnection', function() {

    function moved(bounds, delta) {
      return {
        x: bounds.x + (delta.x || 0),
        y: bounds.y + (delta.y || 0),
        width: bounds.width,
        height: bounds.height
      };
    }

    function connect(start, end, a, b) {
      return connectRectangles(start, end, a, b);
    }

    function repair(start, end, a, b, waypoints, hints) {
      return repairConnection(start, end, a, b, waypoints, hints);
    }


    describe('v:v layout preferred', function() {

      it('should relayout vertical', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(250, 400, 100, 100);

        var waypoints = [];

        // when
        var repaired = repair(start, end, waypoints, { preferredLayouts: [ 'v:v' ] });

        // then
        expect(repaired).to.eql([
          { original: { x: 150, y: 150 }, x: 150, y: 200 },
          { x: 150, y: 300 }, // vertical intermediate
          { x: 300, y: 300 }, // line segment
          { original: { x: 300, y: 450 }, x: 300, y: 400 }
        ]);
      });


      it('should relayout horizontal', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(300, 50, 100, 300);

        var waypoints = [];

        // when
        var repaired = repair(start, end, waypoints, { preferredLayouts: [ 'v:v' ] });

        // then
        expect(repaired).to.eql([
          { original: { x: 150, y: 150 }, x: 200, y: 150 },
          { x: 250, y: 150 }, // horizontal intermediate
          { x: 250, y: 200 }, // line segment
          { original: { x: 350, y: 200 }, x: 300, y: 200 }
        ]);
      });

    });


    describe('straight layout preferred', function() {

      it('should layout straight line (horizontal)', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(300, 50, 100, 300);

        var waypoints = [];

        // when
        var repaired = repair(start, end, waypoints, { preferredLayouts: [ 'straight' ] });

        // then
        expect(repaired).to.eql([
          { x: 150, y: 150 },
          { x: 350, y: 150, original: { x: 350, y: 150 } }
        ]);
      });


      it('should layout straight line (horizontal), preserving target docking', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(300, 50, 100, 300);

        var waypoints = [];

        // when
        var repaired = repair(start, end, waypoints, {
          preferredLayouts: [ 'straight' ],
          preserveDocking: 'target'
        });

        // then
        expect(repaired).to.eql([
          { x: 150, y: 200, original: { x: 150, y: 200 } },
          { x: 350, y: 200 }
        ]);
      });


      it('should layout straight line (vertical)', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(50, 300, 200, 100);

        var waypoints = [];

        // when
        var repaired = repair(start, end, waypoints, { preferredLayouts: [ 'straight' ] });

        // then
        expect(repaired).to.eql([
          { x: 150, y: 150 },
          { x: 150, y: 350, original: { x: 150, y: 350 } }
        ]);
      });


      it('should layout straight line (vertical), preserving target docking', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(50, 300, 200, 100);

        var waypoints = [];

        // when
        var repaired = repair(start, end, waypoints, {
          preferredLayouts: [ 'straight' ],
          preserveDocking: 'target'
        });

        // then
        expect(repaired).to.eql([
          { x: 150, y: 150, original: { x: 150, y: 150 } },
          { x: 150, y: 350 }
        ]);
      });

    });


    describe('relayout', function() {

      it('should relayout if no bendpoints', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(200, 400, 100, 100);

        var waypoints = [];

        // when
        var repaired = repair(start, end, waypoints);

        // then
        expect(repaired).to.eql([
          { original: { x: 150, y: 150 }, x: 150, y: 200 },
          { x: 150, y: 300 },
          { x: 250, y: 300 },
          { original: { x: 250, y: 450 }, x: 250, y: 400 }
        ]);
      });


      it('should relayout if bendpoints overlapped', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(100, 400, 100, 100);

        var waypoints = [
          { x: 150, y: 150 },
          { x: 250, y: 150 },
          { original: { x: 250, y: 450 }, x: 250, y: 400 }
        ];

        // when
        var repaired = repair(start, end, waypoints, { connectionEnd: true });

        // then
        expect(repaired).to.eql([
          { original: { x: 150, y: 150 }, x: 150, y: 200 },
          { original: { x: 150, y: 450 }, x: 150, y: 400 }
        ]);
      });


      it('should relayout if points aligned', function() {

        // given
        var start = rect(100, 100, 100, 100);

        var waypoints = [
          { x: 200, y: 150, original: { x: 150, y: 150 } },
          { x: 300, y: 150 },
          { x: 300, y: 250 },
          { x: 400, y: 250, original: { x: 450, y: 250 } }
        ];

        // when
        var repaired = repair(start, start, waypoints, {
          connectionEnd: { x: 150, y: 150 },
          preferredLayouts: [ 'r:b' ]
        });

        // then
        expect(repaired).to.eql([
          { x: 200, y: 150, original: { x: 150, y: 150 } },
          { x: 220, y: 150 },
          { x: 220, y: 220 },
          { x: 150, y: 220 },
          { x: 150, y: 200, original: { x: 150, y: 150 } }
        ]);
      });

    });


    describe('bendpoint removal', function() {

      it('should remove overlapping bendpoints', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(200, 400, 100, 100),
            newEnd = moved(end, { x: 50, y: -100 }); // move on second bendpoint

        var waypoints = [
          { original: { x: 150, y: 150 }, x: 150, y: 200 },
          { x: 150, y: 300 },
          { x: 250, y: 300 },
          { original: { x: 250, y: 450 }, x: 250, y: 400 }
        ];

        // when
        var repaired = repair(start, newEnd, waypoints, { connectionEnd: true });

        // then
        expect(repaired).to.eql([
          { original: { x: 150, y: 150 }, x: 150, y: 200 },
          { x: 150, y: 350 },
          { x: 300, y: 350 }
        ]);
      });


      it('should remove all from overlapping bendpoint', function() {

        // given
        var start = rect(100, 100, 100, 100),
            end = rect(200, 400, 100, 100),
            newEnd = moved(end, { x: 50, y: -100 }); // move on second bendpoint

        var waypoints = [
          { original: { x: 150, y: 150 }, x: 150, y: 200 },
          { x: 150, y: 300 },

          // <custom garbage bendpoints>
          { x: 250, y: 300 },
          { x: 150, y: 300 },

          // </custom garbage bendpoints>
          { x: 250, y: 300 },
          { original: { x: 250, y: 450 }, x: 250, y: 400 }
        ];

        // when
        var repaired = repair(start, newEnd, waypoints, { connectionEnd: true });

        // then
        expect(repaired).to.eql([
          { original: { x: 150, y: 150 }, x: 150, y: 200 },
          { x: 150, y: 350 },
          { x: 300, y: 350 }
        ]);
      });

    });


    describe('bendpoint adjustment', function() {

      describe('misc', function() {

        it('should adjust single bendpoints', function() {

          // given
          var start = rect(50, 100, 100, 100),
              end = rect(200, 400, 100, 100),
              newStart = moved(start, { x: 50 });

          var waypoints = [
            { x: 100, y: 150 },
            { x: 250, y: 150 },
            { original: { x: 250, y: 450 }, x: 250, y: 400 }
          ];

          // when
          var repaired = repair(newStart, end, waypoints, { connectionStart: true });

          // then
          expect(repaired).to.eql([
            { x: 150, y: 150 },
            { x: 250, y: 150 },
            { original: { x: 250, y: 450 }, x: 250, y: 400 }
          ]);
        });


        it('should not layout free flow', function() {

          // given
          var start = rect(100, 100, 100, 100),
              end = rect(200, 400, 100, 100),
              newEnd = moved(end, { x: 100, y: 50 });

          var waypoints = [
            { original: { x: 150, y: 150 }, x: 150, y: 200 },
            { x: 150, y: 300 },

            // diagonal connection
            { x: 250, y: 450 }
          ];

          // when
          var repaired = repair(start, newEnd, waypoints, { connectionEnd: true });

          // then
          expect(repaired).to.eql(waypoints.slice(0, 2).concat([ { x: 350, y: 500 } ]));
        });

      });


      describe('repair start', function() {

        var start = rect(100, 100, 100, 100),
            end = rect(200, 400, 100, 100);


        it('should repair move x', function() {

          // given
          var waypoints = connect(start, end),
              newStart = moved(start, { x: 50 });

          // when
          var repaired = repair(newStart, end, waypoints, { connectionStart: true });

          // then
          expect(repaired).to.eql([ { x: 200, y: 150 }, { x: 200, y: 300 } ].concat(waypoints.slice(2)));
        });


        it('should repair move y', function() {

          // given
          var waypoints = connect(start, end),
              newStart = moved(start, { y: 50 });

          // when
          var repaired = repair(newStart, end, waypoints, { connectionStart: true });

          // then
          expect(repaired).to.eql([ { x: 150, y: 200 }, { x: 150, y: 300 } ].concat(waypoints.slice(2)));
        });


        it('should repair move x,y', function() {

          // given
          var waypoints = connect(start, end),
              newStart = moved(start, { x: 100, y: -50 });

          // when
          var repaired = repair(newStart, end, waypoints, { connectionStart: true });

          // then
          expect(repaired).to.eql([ { x: 250, y: 150, original: { x: 250, y: 100 } } ]
            .concat(waypoints[ waypoints.length - 1 ]));
        });

      });


      describe('repair end', function() {

        var start = rect(100, 100, 100, 100),
            end = rect(150, 400, 100, 100);

        it('should repair move x', function() {

          // given
          var waypoints = connect(start, end),
              newEnd = moved(end, { x: 50 });

          // when
          var repaired = repair(start, newEnd, waypoints, { connectionEnd: true });

          // then
          expect(repaired).to.eql(waypoints.slice(0, 2).concat([ { x: 250, y: 300 }, { x: 250, y: 450 } ]));
        });


        it('should repair move y', function() {

          // given
          var waypoints = connect(start, end),
              newEnd = moved(end, { y: 50 });

          // when
          var repaired = repair(start, newEnd, waypoints, { connectionEnd: true });

          // then
          expect(repaired).to.eql(waypoints.slice(0, 3).concat([ { x: 200, y: 500 } ]));
        });


        it('should repair move x,y', function() {

          // given
          var waypoints = connect(start, end),
              newEnd = moved(end, { x: 100, y: -50 });

          // when
          var repaired = repair(start, newEnd, waypoints, { connectionEnd: true });

          // then
          expect(repaired).to.eql(waypoints.slice(0, 2).concat([ { x: 300, y: 300 }, { x: 300, y: 400 } ]));
        });

      });

    });

  });

});
