import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - update root', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

  }));


  describe('should update the commandStack', function() {

    it('execute', inject(function(canvas, modeling, elementFactory) {

      // given
      var newRoot = elementFactory.createRoot({
        id: 'newRoot'
      });

      // when
      modeling.updateRoot(newRoot);

      // then
      var newRootCanvas = canvas.getRootElement();

      expect(newRootCanvas).to.exist;
      expect(newRootCanvas).to.eql(newRoot);
    }));


    it('undo', inject(function(canvas, modeling, commandStack, elementFactory) {

      // given
      var newRoot = elementFactory.createRoot({
        id: 'newRoot'
      });

      // when
      modeling.updateRoot(newRoot);

      commandStack.undo();

      // then
      var rootCanvas = canvas.getRootElement();

      expect(rootCanvas).to.exist;
      expect(rootCanvas).to.eql(rootShape);
    }));


    it('redo', inject(function(canvas, modeling, commandStack, elementFactory) {

      // given
      var newRoot = elementFactory.createRoot({
        id: 'newRoot'
      });

      // when
      modeling.updateRoot(newRoot);

      commandStack.undo();
      commandStack.redo();

      // then
      var rootCanvas = canvas.getRootElement();

      expect(rootCanvas).exist;
      expect(rootCanvas).to.eql(newRoot);
    }));

  });


  it('should return new root element', inject(function(canvas, modeling, elementFactory) {

    // given
    var newRoot = elementFactory.createRoot({
      id: 'newRoot'
    });

    // when
    var newRootReturned = modeling.updateRoot(newRoot);

    // then
    var rootCanvas = canvas.getRootElement();

    expect(rootCanvas).exist;

    expect(rootCanvas).to.eql(newRootReturned);
  }));


  it('should keep custom attributes', inject(function(canvas, modeling, elementFactory) {

    // given
    var newRoot = elementFactory.createRoot({
      id: 'newRoot',
      customVal: 'foo',
      customArr: [ 'bar' ]
    });

    // when
    modeling.updateRoot(newRoot);

    // then
    var rootCanvas = canvas.getRootElement();

    expect(rootCanvas).exist;

    expect(rootCanvas).to.eql(newRoot);
  }));


  it('should delete old root element from elementRegistry', inject(function(modeling, elementFactory, elementRegistry) {

    // given
    var newRoot = elementFactory.createRoot({
      id: 'newRoot'
    });

    // when
    modeling.updateRoot(newRoot);

    // then
    var rootCanvas = elementRegistry.get('root');

    expect(rootCanvas).not.to.exist;
  }));

});
