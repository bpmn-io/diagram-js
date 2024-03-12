import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper.js';

import mouseModule from 'lib/features/mouse/index.js';

import { createMoveEvent } from 'lib/features/mouse/Mouse.js';


describe('features/mouse', function() {

  beforeEach(bootstrapDiagram({ modules: [ mouseModule ] }));


  it('should return last mousemove event', inject(function(canvas, mouse) {

    // when
    mousemoveEvent(canvas._svg);

    // then
    expect(mouse.getLastMoveEvent()).to.exist;
  }));


  it('should always return event', inject(function(mouse) {

    // then
    expect(mouse.getLastMoveEvent()).to.exist;
  }));

});

// helpers //////////

function mousemoveEvent(element) {

  var event = createMoveEvent(0, 0);

  element.dispatchEvent(event);

  return event;
}