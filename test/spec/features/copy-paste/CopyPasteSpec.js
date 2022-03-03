import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  filter,
  isArray,
  isNumber,
  pick,
  some
} from 'min-dash';

import attachSupportModule from 'lib/features/attach-support';
import copyPasteModule from 'lib/features/copy-paste';
import modelingModule from 'lib/features/modeling';
import rulesModule from './rules';
import selectionModule from 'lib/features/selection';

var HIGH_PRIORITY = 2000;


describe('features/copy-paste', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      attachSupportModule,
      copyPasteModule,
      modelingModule,
      rulesModule,
      selectionModule
    ]
  }));


  describe('basics', function() {

    var rootShape,
        parentShape,
        parentShape2,
        host,
        attacher,
        childShape,
        childShape2,
        connection,
        collapsedShape,
        hiddenContainedChild,
        collapsedShape2,
        hiddenContainedParent,
        hiddenContainedChild2;


    beforeEach(inject(function(elementFactory, canvas, modeling) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      parentShape = elementFactory.createShape({
        id: 'parent',
        x: 600, y: 200,
        width: 600, height: 300
      });

      canvas.addShape(parentShape, rootShape);

      parentShape2 = elementFactory.createShape({
        id: 'parent2',
        x: 90, y: 15,
        width: 425, height: 300
      });

      canvas.addShape(parentShape2, rootShape);

      host = elementFactory.createShape({
        id: 'host',
        x: 300, y: 50,
        width: 100, height: 100
      });

      canvas.addShape(host, parentShape2);

      attacher = elementFactory.createShape({
        id: 'attacher',
        x: 375, y: 25,
        width: 50, height: 50
      });

      canvas.addShape(attacher, parentShape2);

      modeling.updateAttachment(attacher, host);

      childShape = elementFactory.createShape({
        id: 'childShape',
        x: 110, y: 110,
        width: 100, height: 100
      });

      canvas.addShape(childShape, parentShape2);

      childShape2 = elementFactory.createShape({
        id: 'childShape2',
        x: 400, y: 200,
        width: 100, height: 100
      });

      canvas.addShape(childShape2, parentShape2);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 160, y: 160 },
          { x: 450, y: 250 }
        ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection, parentShape2);

      collapsedShape = elementFactory.createShape({
        id: 'collapsedShape',
        x: 800, y: 800, width: 300, height: 300,
        collapsed: true
      });

      canvas.addShape(collapsedShape, rootShape);

      hiddenContainedChild = elementFactory.createShape({
        id: 'hiddenContainedChild',
        x: 850, y: 810, width: 100, height: 100,
        hidden: true
      });

      canvas.addShape(hiddenContainedChild, collapsedShape);

      collapsedShape2 = elementFactory.createShape({
        id: 'collapsedShape2',
        x: 1000, y: 1000, width: 30, height: 30,
        collapsed: true
      });

      canvas.addShape(collapsedShape2, rootShape);

      hiddenContainedParent = elementFactory.createShape({
        id: 'hiddenContainedParent',
        x: 1000, y: 1000, width: 20, height: 20,
        hidden: true,
        collapsed: true
      });

      canvas.addShape(hiddenContainedParent, collapsedShape2);

      hiddenContainedChild2 = elementFactory.createShape({
        id: 'hiddenContainedChild2',
        x: 1000, y: 1000, width: 10, height: 10,
        hidden: true,
      });

      canvas.addShape(hiddenContainedChild2, hiddenContainedParent);


    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    describe('events', function() {

      it('should fire <copyPaste.canCopyElements> if elements are going to be copied', function(done) {
        getDiagramJS().invoke(function(copyPaste, eventBus) {

          // given
          eventBus.on('copyPaste.canCopyElements', function(context) {
            var elements = context.elements;

            // then
            expect(elements).to.have.length(1);
            expect(elements[0]).to.have.equal(parentShape2);

            done();
          });

          // when
          copyPaste.copy(parentShape2);
        });
      });


      it('should only copy elements returned from <copyPaste.canCopyElements>', inject(
        function(copyPaste, eventBus) {

          // given
          eventBus.on('copyPaste.canCopyElements', function() {
            return [ parentShape2 ];
          });

          // when
          var tree = copyPaste.copy([ parentShape, parentShape2 ]);

          // then
          expect(findElementInTree(parentShape, tree)).not.to.be.ok;
          expect(findElementInTree(parentShape2, tree)).to.be.ok;
        }
      ));


      it('should NOT copy elements if disallowed through <copyPaste.canCopyElements>', inject(
        function(copyPaste, eventBus) {

          // given
          eventBus.on('copyPaste.canCopyElements', function() {
            return false;
          });

          // when
          var tree = copyPaste.copy([ parentShape, parentShape2 ]);

          // then
          expect(findElementInTree(parentShape, tree)).not.to.be.ok;
          expect(findElementInTree(parentShape2, tree)).not.to.be.ok;
        }
      ));


      it('should fire <copyPaste.elementsCopied> if elements were copied', function(done) {
        getDiagramJS().invoke(function(clipboard, copyPaste, eventBus) {

          // given
          eventBus.on('copyPaste.elementsCopied', function(context) {
            var elements = context.elements,
                tree = context.tree;

            // then
            expect(elements).to.have.length(1);
            expect(elements[0]).to.equal(parentShape2);

            expect(clipboard.isEmpty()).to.be.false;
            expect(clipboard.get()).to.equal(tree);

            done();
          });

          // when
          copyPaste.copy(parentShape2);
        });
      });


      it('should set empty tree if copying is not allowed', inject(function(copyPaste, eventBus) {

        // given
        eventBus.on('copyPaste.canCopyElements', function(context) {
          var elements = context.elements;

          if (elements.indexOf(parentShape2) !== -1) {
            return false;
          }
        });

        copyPaste.copy(parentShape);

        // when
        var tree = copyPaste.copy(parentShape2);

        // then
        expect(tree).to.be.empty;
      }));


      it('should NOT allow copying element', inject(function(copyPaste, eventBus) {

        // given
        eventBus.on('commandStack.element.copy.canExecute', HIGH_PRIORITY, function(event) {
          var context = event.context,
              element = context.element;

          if (element === parentShape2) {
            return false;
          }
        });

        // when
        var tree = copyPaste.copy([ parentShape, parentShape2 ]);

        // then
        expect(findElementInTree(parentShape, tree)).to.be.ok;
        expect(findElementInTree(parentShape2, tree)).not.to.be.ok;
      }));

    });


    describe('copy', function() {

      it('should copy elements', inject(function(copyPaste) {

        // when
        var tree = copyPaste.copy(childShape);

        // then
        expect(tree).to.exist;

        expect(findElementInTree(childShape, tree)).to.be.ok;
      }));


      it('should add copied elements to clipboard', inject(function(clipboard, copyPaste) {

        // when
        var tree = copyPaste.copy(parentShape2);

        // then
        expect(tree).to.equal(clipboard.get());
      }));


      it('should copy children of copied elements', inject(function(copyPaste) {

        // when
        var tree = copyPaste.copy(parentShape2);

        // then
        expect(findElementsInTree(parentShape2, tree, 0)).to.exist;

        expect(findElementsInTree([
          childShape,
          childShape2,
          connection,
          host
        ], tree, 1)).to.be.ok;
      }));


      it('should copy attachers and connections of copied elements', inject(function(copyPaste) {

        // when
        var tree = copyPaste.copy([
          childShape,
          childShape2,
          host
        ]);

        // then
        expect(findElementsInTree([
          childShape,
          childShape2,
          connection,
          host
        ], tree, 0)).to.be.ok;
      }));


      it('should NOT copy connection without source', inject(function(copyPaste) {

        // when
        var tree = copyPaste.copy([ childShape, connection ]);


        // then
        expect(findElementsInTree(connection, tree, 0)).to.be.false;

        expect(findElementsInTree(connection, tree, 1)).to.be.false;
      }));


      it('should NOT copy connection without target', inject(function(copyPaste) {

        // when
        var tree = copyPaste.copy([ childShape2, connection ]);


        // then
        expect(findElementsInTree(connection, tree, 0)).to.be.false;

        expect(findElementsInTree(connection, tree, 1)).to.be.false;
      }));


      it('should copy attacher without host', inject(function(copyPaste) {

        // when
        var tree = copyPaste.copy(attacher);

        // then
        expect(findElementInTree(attacher, tree, 0)).to.be.ok;
      }));

    });


    describe('paste', function() {

      describe('events', function() {

        it('should fire <copyPaste.pasteElements> event when pasting elements', function(done) {
          getDiagramJS().invoke(function(copyPaste, elementFactory, eventBus) {

            // given
            eventBus.on('copyPaste.pasteElements', function(context) {
              var hints = context.hints;

              expect(hints).to.exist;

              done();
            });

            copyPaste.copy(elementFactory.createShape());

            // when
            copyPaste.paste();
          });
        });


        it('should fire <copyPaste.pasteElements> event when pasting elements', function(done) {
          getDiagramJS().invoke(function(copyPaste, elementFactory, eventBus) {

            // given
            eventBus.on('copyPaste.pasteElement', function(context) {
              var cache = context.cache,
                  descriptor = context.descriptor;

              expect(cache).to.exist;
              expect(descriptor).to.exist;

              done();
            });

            copyPaste.copy(elementFactory.createShape());

            // when
            copyPaste.paste();
          });
        });

      });


      it('should paste', inject(function(copyPaste) {

        // given
        copyPaste.copy([
          childShape,
          host
        ]);

        // when
        copyPaste.paste({
          element: parentShape,
          point: {
            x: 900,
            y: 350
          }
        });

        // then
        expect(parentShape.children).to.have.length(3);
      }));


      it('should paste and attach', inject(function(copyPaste) {

        // given
        copyPaste.copy(attacher);

        // when
        var element = copyPaste.paste({
          element: host,
          point: {
            x: host.x,
            y: host.y
          },
          hints: {
            attach: 'attach'
          }
        })[0];

        // then
        expect(element.host).to.eql(host);
      }));


      it('should paste and detach', inject(function(copyPaste) {

        // given
        copyPaste.copy(attacher);

        // when
        var element = copyPaste.paste({
          element: parentShape,
          point: {
            x: 1000,
            y: 1000
          }
        })[0];

        // then
        expect(element.host).not.to.exist;
      }));

      it('should keep hidden element hidden', inject(function(copyPaste) {

        // given
        copyPaste.copy(collapsedShape);

        // when
        var elements = copyPaste.paste({
          element: rootShape,
          point: {
            x: 1500,
            y: 1500
          }
        });

        // then
        expect(elements[0].children).to.to.have.members([ elements[1] ]);
        expect(elements[0].collapsed).to.be.true;
        expect(elements[1].hidden).to.be.true;

      }));

      it('should keep hidden elements inside hidden elements hidden', inject(function(copyPaste) {

        // given
        copyPaste.copy(collapsedShape2);

        // when
        var elements = copyPaste.paste({
          element: rootShape,
          point: {
            x: 1500,
            y: 1500
          }
        });

        // then
        expect(elements[0].children).to.to.have.members([ elements[1] ]);
        expect(elements[0].collapsed).to.be.true;
        expect(elements[1].hidden).to.be.true;
        expect(elements[1].children).to.to.have.members([ elements[2] ]);
        expect(elements[1].collapsed).to.be.true;
        expect(elements[2].hidden).to.be.true;

      }));


    });

  });


  describe('#createTree', function() {

    var attacherShape,
        childShape1,
        childShape2,
        connection1,
        connection2,
        grandChildShape1,
        grandChildShape2,
        grandChildShape3,
        grandChildShape4,
        hostShape,
        labelShape1,
        labelShape2,
        parentShape;

    beforeEach(function() {
      parentShape = { id: 'parentShape' };
      childShape1 = { id: 'childShape1', parent: parentShape };
      hostShape = { id: 'hostShape', parent: parentShape };
      attacherShape = { id: 'attacherShape', parent: parentShape };

      parentShape.children = [ childShape1, hostShape, attacherShape ];

      hostShape.attachers = [ attacherShape ];
      attacherShape.host = hostShape;

      grandChildShape1 = { id: 'grandChildShape1', parent: childShape1 };
      grandChildShape2 = { id: 'grandChildShape2', parent: childShape1 };

      childShape1.children = [ grandChildShape1, grandChildShape2 ];

      childShape2 = { id: 'childShape2', parent: parentShape };
      grandChildShape3 = { id: 'grandChildShape3', parent: childShape2 };
      grandChildShape4 = { id: 'grandChildShape4', parent: childShape2 };
      labelShape1 = { id: 'labelShape1', parent: childShape2 };

      childShape2.children = [ grandChildShape3, grandChildShape4, labelShape1 ];

      grandChildShape4.labels = [ labelShape1 ];
      labelShape1.labelTarget = grandChildShape4;

      connection1 = { id: 'connection1', parent: childShape1, waypoints: [] };
      connection2 = { id: 'connection2', parent: parentShape, waypoints: [] };
      labelShape2 = { id: 'labelShape2', parent: parentShape };

      connection1.source = grandChildShape1;
      connection1.target = grandChildShape2;

      connection2.source = grandChildShape1;
      connection2.target = grandChildShape3;
      connection2.labels = [ labelShape2 ];

      labelShape2.labelTarget = connection2;

      grandChildShape1.outgoing = [ connection1, connection2 ];
      grandChildShape2.incoming = [ connection1 ];
      grandChildShape3.incoming = [ connection2 ];
    });


    it('should create tree', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ grandChildShape1 ]);

      // then
      expect(findElementInTree(grandChildShape1, tree, 0)).to.be.ok;
    }));


    it('should fire <copyPaste.createTree> for each shape', inject(function(copyPaste, eventBus) {

      // given
      var createTreeSpy = sinon.spy();

      eventBus.on('copyPaste.createTree', createTreeSpy);

      // when
      copyPaste.createTree([ childShape1 ]);

      // then
      expect(createTreeSpy).to.have.been.calledThrice;
    }));


    it('should include children', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ childShape1 ]);

      // then
      expect(findElementInTree(childShape1, tree, 0)).to.be.ok;

      expect(findElementsInTree([
        grandChildShape1,
        grandChildShape2,
        connection1
      ], tree, 1)).to.be.ok;
    }));


    it('should allow adding children to be added to tree', inject(function(copyPaste, eventBus) {

      // given
      var additionalChild = { id: 'additionalChild' };

      eventBus.on('copyPaste.createTree', function(context) {
        var children = context.children,
            element = context.element;

        if (grandChildShape1 === element) {
          children.push(additionalChild);
        }
      });

      // when
      var tree = copyPaste.createTree([ grandChildShape1 ]);

      // then
      expect(findElementsInTree([
        grandChildShape1,
        additionalChild
      ], tree)).to.be.ok;
    }));


    it('should include labels', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ grandChildShape4 ]);

      // then
      expect(findElementsInTree([ grandChildShape4, labelShape1 ], tree, 0)).to.be.ok;
    }));


    it('should NOT include labels if labelTarget is not included', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ grandChildShape1 ]);

      // then
      expect(findElementInTree(labelShape2, tree, 0)).not.to.be.ok;
    }));


    it('should update depth', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ connection2, childShape1, childShape2 ]);

      // then
      // connection is added first but needs to be moved to depth 1 later
      expect(findElementInTree(connection2, tree, 1)).to.be.ok;
    }));


    it('should include connections if source and target are included', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ grandChildShape1, grandChildShape2 ]);

      // then
      expect(findElementsInTree([
        grandChildShape1,
        grandChildShape2,
        connection1
      ], tree, 0)).to.be.ok;
    }));


    it('should NOT include connections if source is not included', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ grandChildShape1 ]);

      // then
      expect(findElementInTree(connection2, tree, 0)).not.to.be.ok;
    }));


    it('should NOT include connections if target is not included', inject(function(copyPaste) {

      // when
      var tree = copyPaste.createTree([ grandChildShape3 ]);

      // then
      expect(findElementInTree(connection2, tree, 0)).not.to.be.ok;
    }));

  });

});

// helpers //////////

/**
 * Find elements in a tree.
 * Return found elements or false.
 *
 * @param {Array<djs.model.Base>} elements
 * @param {Object} tree
 * @param {number} [depth]
 *
 * @returns {Array<djs.model.Base>|false}
 */
function findElementsInTree(elements, tree, depth) {
  var foundElements = _findElementsInTree(elements, tree, depth);

  if (foundElements.length !== elements.length) {
    return false;
  }

  return foundElements;
}

/**
 * Find element in a tree.
 * Return found element or false.
 *
 * @param {djs.model.Base} element
 * @param {Object} tree
 * @param {number} [depth]
 *
 * @returns {djs.model.Base|false}
 */
function findElementInTree(elements, tree, depth) {
  var foundElements = _findElementsInTree(elements, tree, depth);

  if (foundElements.length !== 1) {
    return false;
  }

  return foundElements[0];
}

function _findElementsInTree(elements, tree, depth) {
  if (!isArray(elements)) {
    elements = [ elements ];
  }

  var depths;

  if (isNumber(depth)) {
    depths = pick(tree, [ depth ]);
  } else {
    depths = tree;
  }

  return filter(elements, function(element) {

    return some(depths, function(depth) {

      return some(depth, function(descriptor) {
        return element.id === descriptor.id;
      });
    });
  });
}
