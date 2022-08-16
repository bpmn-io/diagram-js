import Diagram from '../..';


describe('Diagram', function() {

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  describe('runtime', function() {

    it('should bootstrap', function() {

      new Diagram({
        canvas: {
          container: container,
          width: 700,
          height: 500
        }
      });
    });


    it('should offer #destroy method', function() {

      // when
      var diagram = new Diagram({
        canvas: {
          container: container,
          width: 700,
          height: 500
        }
      });

      // then
      expect(diagram.destroy).to.be.an('function');
    });


    it('should throw inspectable errors', function() {

      expect(function() {
        new Diagram({
          modules: {
            __init__: [
              function(foo) {}
            ]
          }
        });
      }).to.throw(/No provider for "foo"!/);
    });


    describe('should expose diagram services', function() {


      it('via #get', function() {

        // when
        var diagram = new Diagram({
          canvas: {
            container: container,
            width: 700,
            height: 500
          }
        });

        // then
        expect(diagram.get('canvas')).to.be.an('object');
      });


      it('via #get / non-existing service', function() {

        // when
        var diagram = new Diagram({
          canvas: {
            container: container,
            width: 700,
            height: 500
          }
        });

        // then
        expect(function() {
          diagram.get('foobar');
        }).to.throw('No provider for "foobar"! (Resolving: foobar)');
      });


      it('via #get / non-existing optional service', function() {

        // when
        var diagram = new Diagram({
          canvas: {
            container: container,
            width: 700,
            height: 500
          }
        });

        // then
        expect(diagram.get('foobar', false)).to.be.null;
      });


      it('via #invoke', function() {

        // when
        var diagram = new Diagram({
          canvas: {
            container: container,
            width: 700,
            height: 500
          }
        });

        diagram.invoke([ 'canvas', function(canvas) {
          canvas.addShape({ id: 's1', x: 10, y: 10, width: 30, height: 30 });
          canvas.addShape({ id: 's2', x: 100, y: 100, width: 30, height: 30 });

          canvas.addConnection({ id: 'c1', waypoints: [ { x: 25, y: 25 }, { x: 115, y: 115 } ] });
        } ]);
      });

    });

  });

});
