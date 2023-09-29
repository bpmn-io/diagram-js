import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  classes as svgClasses
} from 'tiny-svg';


describe('GraphicsFactory', function() {

  beforeEach(bootstrapDiagram());


  it('should not fail on update root shape', inject(
    function(canvas, graphicsFactory, elementRegistry) {

      // given
      var root = canvas.getRootElement();
      var gfx = elementRegistry.getGraphics(root);

      // when
      graphicsFactory.update('shape', root, gfx);

      // then
      // expect not to throw an exception
    }
  ));


  it('should add <djs-frame> class to frames', inject(
    function(canvas, graphicsFactory, elementFactory) {

      // given
      var root = canvas.getRootElement();
      var element = elementFactory.createShape({
        id: 'frameShape',
        isFrame: true,
        parent: root
      });

      // when
      var gfx = graphicsFactory.create('shape', element);

      // then
      expect(svgClasses(gfx).has('djs-frame')).to.equal(true);
    }));


  it('should propagate additional attributes when drawing shape', inject(
    function(canvas, elementFactory, eventBus, graphicsFactory) {

      // given
      var root = canvas.getRootElement();

      var element = elementFactory.createShape({
        id: 'shape',
        parent: root
      });

      var gfx = graphicsFactory.create('shape', element);

      var spy = sinon.spy();

      eventBus.on('render.shape', spy);

      // when
      graphicsFactory.drawShape(gfx, element, { foo: 'bar' });

      // then
      expect(spy).to.have.been.calledWith(sinon.match({
        attrs: { foo: 'bar' }
      }));
    }));


  it('should propagate additional attributes when drawing connection', inject(
    function(canvas, elementFactory, eventBus, graphicsFactory) {

      // given
      var root = canvas.getRootElement();

      var element = elementFactory.createConnection({
        id: 'connection',
        parent: root,
        waypoints: [
          {
            x: 0,
            y: 0
          },
          {
            x: 0,
            y: 100
          }
        ]
      });

      var gfx = graphicsFactory.create('connection', element);

      var spy = sinon.spy();

      eventBus.on('render.connection', spy);

      // when
      graphicsFactory.drawConnection(gfx, element, { foo: 'bar' });

      // then
      expect(spy).to.have.been.calledWith(sinon.match({
        attrs: { foo: 'bar' }
      }));
    }));

});
