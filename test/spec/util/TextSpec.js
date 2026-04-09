import { expect } from 'chai';

import Text from 'lib/util/Text';


describe('util - Text (backwards compatibility)', function() {

  it('should be importable from lib/util/Text', function() {
    expect(Text).to.exist;
    expect(Text).to.be.a('function');
  });


  it('should be instantiable', function() {

    // when
    var text = new Text({
      size: { width: 100 },
      padding: 0,
      style: {
        fontSize: '14px'
      }
    });

    // then
    expect(text).to.exist;
    expect(text.createText).to.be.a('function');
    expect(text.getDimensions).to.be.a('function');
    expect(text.layoutText).to.be.a('function');
  });

});
