import { expect } from 'chai';

import {
  match,
  spy
} from 'sinon';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  classes as svgClasses
} from 'tiny-svg';

import changeSupportModule from 'lib/features/change-support';
import interactionEventsModule from 'lib/features/interaction-events';

import {
  query as domQuery
} from 'min-dom';

import { recordChildChanges } from 'test/util/DomMutations';


describe('core/GraphicsFactory', function() {

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

      var renderSpy = spy();

      eventBus.on('render.shape', renderSpy);

      // when
      graphicsFactory.drawShape(gfx, element, { foo: 'bar' });

      // then
      expect(renderSpy).to.have.been.calledWith(match({
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

      var renderSpy = spy();

      eventBus.on('render.connection', renderSpy);

      // when
      graphicsFactory.drawConnection(gfx, element, { foo: 'bar' });

      // then
      expect(renderSpy).to.have.been.calledWith(match({
        attrs: { foo: 'bar' }
      }));
    }
  ));


  describe('on containment update', function() {

    it('should not detach unchanged siblings on update', inject(
      function(canvas, graphicsFactory, elementRegistry) {

        // given
        var shape1 = canvas.addShape({
          id: 's1', x: 10, y: 10, width: 50, height: 50
        });

        var shape2 = canvas.addShape({
          id: 's2', x: 100, y: 10, width: 50, height: 50
        });

        var shape2Group = elementRegistry.getGraphics(shape2).parentNode;
        var childrenGfx = shape2Group.parentNode;

        // when
        // simulate shape1 having changed (e.g. its label was updated)
        var changes = recordChildChanges(childrenGfx, function() {
          graphicsFactory.updateContainments([ shape1 ]);
        });

        // then
        expect(changes.touched(shape2Group), 'unchanged sibling must not be detached').to.be.false;
        expect(shape2Group.parentNode).to.equal(childrenGfx);
      }
    ));


    it('should reorder children to match model order', inject(
      function(canvas, graphicsFactory, elementRegistry) {

        // given
        var root = canvas.getRootElement();

        var shape1 = canvas.addShape({
          id: 's1', x: 10, y: 10, width: 50, height: 50
        });

        var shape2 = canvas.addShape({
          id: 's2', x: 100, y: 10, width: 50, height: 50
        });

        var shape3 = canvas.addShape({
          id: 's3', x: 200, y: 10, width: 50, height: 50
        });

        var rootGfx = elementRegistry.getGraphics(root);

        // when
        // model order changes to [ s3, s1, s2 ]
        root.children = [ shape3, shape1, shape2 ];

        graphicsFactory.updateContainments([ shape1, shape2, shape3 ]);

        // then
        expect(domOrder(rootGfx)).to.eql([ 's3', 's1', 's2' ]);
      }
    ));

  });


  describe('on element change', function() {

    // exercise the full ChangeSupport -> GraphicsFactory + InteractionEvents
    // path that runs when an element is updated (e.g. label editing completes)
    beforeEach(bootstrapDiagram({
      modules: [
        changeSupportModule,
        interactionEventsModule
      ]
    }));


    it('should keep hit box of changed element (not re-create it)', inject(
      function(canvas, eventBus, elementRegistry) {

        // given
        var shape = canvas.addShape({
          id: 's1', x: 10, y: 10, width: 50, height: 50
        });

        var hit = domQuery('.djs-hit', elementRegistry.getGraphics(shape));

        // assume
        expect(hit, 'hit box exists').to.exist;

        // when
        eventBus.fire('elements.changed', { elements: [ shape ] });

        // then
        // the same hit box node is reused (only its attributes are updated),
        // so an in-progress click on the changed element is not lost
        expect(domQuery('.djs-hit', elementRegistry.getGraphics(shape))).to.equal(hit);
      }
    ));


    it('should not detach changed element or its siblings on change', inject(
      function(canvas, eventBus, elementRegistry) {

        // given
        var shape1 = canvas.addShape({
          id: 's1', x: 10, y: 10, width: 50, height: 50
        });

        var shape2 = canvas.addShape({
          id: 's2', x: 100, y: 10, width: 50, height: 50
        });

        var shape1Group = elementRegistry.getGraphics(shape1).parentNode,
            shape2Group = elementRegistry.getGraphics(shape2).parentNode,
            childrenGfx = shape1Group.parentNode;

        // when
        var changes = recordChildChanges(childrenGfx, function() {
          eventBus.fire('elements.changed', { elements: [ shape1 ] });
        });

        // then
        expect(changes.touched(shape1Group), 'changed element must not be detached').to.be.false;
        expect(changes.touched(shape2Group), 'sibling must not be detached').to.be.false;
      }
    ));

  });

});


// helpers ////////////////

/**
 * @param {Element} elementGfx
 *
 * @return { string[] }
 */
function domOrder(elementGfx) {

  return Array.from(elementGfx.childNodes).filter(
    node => node.classList && node.classList.contains('djs-group')
  ).map(
    group => group.querySelector('.djs-element').getAttribute('data-element-id')
  );
}
