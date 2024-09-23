import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createKeyEvent
} from 'test/util/KeyEvents';

import searchPadModule from 'lib/features/search-pad';
import SearchPad from 'lib/features/search-pad/SearchPad';

import {
  query as domQuery,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

var EVENTS = {
  closed: 'searchPad.closed',
  opened: 'searchPad.opened',
  preselected: 'searchPad.preselected',
  restored: 'searchPad.restored',
  selected: 'searchPad.selected'
};


describe('features/searchPad', function() {

  beforeEach(bootstrapDiagram({ modules: [ searchPadModule ] }));

  var capturedEvents;
  var searchProvider;
  var rootElements;
  var elements;

  var input_node;

  beforeEach(inject(function(searchPad, eventBus, canvas) {

    rootElements = {
      rootA: { id: 'root-a' },
      rootB: { id: 'root-b', }
    };

    canvas.setRootElement(rootElements.rootA);

    canvas.addRootElement(rootElements.rootB);

    elements = {
      one: {
        a: canvas.addShape({ id: 'one-a', x: 0, y: 0, width: 100, height: 100 })
      },
      two: {
        a: canvas.addShape({ id: 'two-a', x: 200, y: 0, width: 100, height: 100 }),
        b: canvas.addShape({ id: 'two-b', x: 400, y: 0, width: 100, height: 100 }, rootElements.rootB)
      }
    };

    function SearchProvider() {

      this.setup = function(pattern, results) {
        this._pattern = pattern;
        this._results = results;
      };

      this.find = function(pattern) {
        if (pattern === this._pattern) {
          return this._results;
        }

        if (pattern === 'one') {
          return [ {
            primaryTokens: [
              { matched: 'One' },
              { normal: ' A' }
            ],
            secondaryTokens: [
              { normal: 'Shape_' },
              { matched: 'one' },
              { normal: '-a' }
            ],
            element: elements.one.a
          } ];
        }

        if (pattern === 'two') {
          return [ {
            primaryTokens: [
              { matched: 'Two' },
              { normal: ' A' }
            ],
            secondaryTokens: [
              { normal: 'Shape_' },
              { matched: 'two' },
              { normal: '-a' }
            ],
            element: elements.two.a
          }, {
            primaryTokens: [
              { matched: 'Two' },
              { normal: ' B' }
            ],
            secondaryTokens: [
              { normal: 'Shape_' },
              { matched: 'two' },
              { normal: '-b' }
            ],
            element: elements.two.b
          } ];
        }

        if (pattern === 'two-b') {
          return [ {
            primaryTokens: [
              { matched: 'Two' },
              { normal: ' B' }
            ],
            secondaryTokens: [
              { normal: 'Shape_' },
              { matched: 'two' },
              { normal: '-b' }
            ],
            element: elements.two.b
          } ];
        }

        if (pattern === 'html') {
          return [ {
            primaryTokens: [
              { normal: '<html/>' }
            ],
            secondaryTokens: [
              { normal: 'some_' },
              { matched: '<html/>' },
              { normal: '_123456_id' }
            ],
            element: elements.one.a
          } ];
        }

        return [];
      };
    }

    searchProvider = new SearchProvider();

    searchPad.registerProvider(searchProvider);

    capturedEvents = [];

    Object.keys(EVENTS).forEach(function(k) {
      var e = EVENTS[k];
      eventBus.on(e, function() {
        capturedEvents.push(e);
      });
    });

    input_node = domQuery(SearchPad.INPUT_SELECTOR, canvas.getContainer());
  }));


  it('should be closed by default', inject(function(searchPad) {

    // then
    expect(searchPad.isOpen()).to.equal(false);
  }));


  it('should open', inject(function(searchPad) {

    // when
    searchPad.open();

    // then
    expect(searchPad.isOpen()).to.equal(true);
    expect(capturedEvents).to.eql([ EVENTS.opened ]);
  }));


  it('should error on open when provider not registered', inject(function(searchPad) {

    // given
    searchPad.registerProvider(undefined);

    // when
    expect(function() {
      searchPad.open();
    }).to.throw('no search provider registered');

    // then
    expect(searchPad.isOpen()).to.equal(false);
    expect(capturedEvents).to.eql([]);
  }));


  describe('close', function() {

    it('should close and restore', inject(function(searchPad) {

      // given
      searchPad.open();

      // when
      searchPad.close();

      // then
      expect(searchPad.isOpen()).to.equal(false);
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.restored, EVENTS.closed ]);
    }));


    it('should close and not restore', inject(function(searchPad) {

      // given
      searchPad.open();

      // when
      searchPad.close(false);

      // then
      expect(searchPad.isOpen()).to.equal(false);
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.closed ]);
    }));


    it('should close on <drag.init> and restore', inject(function(eventBus, searchPad) {

      // given
      searchPad.open();

      // when
      eventBus.fire('drag.init');

      // then
      expect(searchPad.isOpen()).to.equal(false);
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.restored, EVENTS.closed ]);
    }));


    it('should close on <elements.changed> and restore', inject(function(eventBus, searchPad) {

      // given
      searchPad.open();

      // when
      eventBus.fire('elements.changed');

      // then
      expect(searchPad.isOpen()).to.equal(false);
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.restored, EVENTS.closed ]);
    }));


    it('should close on <Escape> and restore', inject(function(searchPad) {

      // given
      searchPad.open();

      // when
      triggerKeyEvent(input_node, 'keyup', 'Escape');

      // then
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.restored, EVENTS.closed ]);
    }));


    it('should close on click and not restore', inject(function(canvas, searchPad) {

      // given
      searchPad.open();

      // when
      triggerMouseEvent(canvas.getContainer(), 'click', 0, 0);

      // then
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.closed ]);
    }));

  });


  it('should toggle open/close', inject(function(searchPad) {

    // when
    searchPad.toggle();
    searchPad.toggle();

    // then
    expect(searchPad.isOpen()).to.equal(false);
    expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.restored, EVENTS.closed ]);

    // when
    searchPad.toggle();

    // then
    expect(searchPad.isOpen()).to.equal(true);
    expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.restored, EVENTS.closed, EVENTS.opened ]);
  }));


  describe('searching/selection', function() {

    beforeEach(inject(function(selection, searchPad) {

      // given
      selection.select(elements.one.a);

      searchPad.open();
    }));


    it('should not search on empty string', function() {

      // given
      var find = sinon.spy(searchProvider, 'find');

      // when
      typeText(input_node, '');

      // then
      expect(find).callCount(0);
    });


    it('should not display root elements', inject(function(canvas) {

      // when
      typeText(input_node, 'root');

      // then
      var result_nodes = domQueryAll(SearchPad.RESULT_SELECTOR, canvas.getContainer());
      expect(result_nodes).length(0);
    }));


    it('should display results', inject(function(canvas) {

      // given
      var find = sinon.spy(searchProvider, 'find');

      // when
      typeText(input_node, 'two');

      // then
      expect(find).callCount(3);
      var result_nodes = domQueryAll(SearchPad.RESULT_SELECTOR, canvas.getContainer());
      expect(result_nodes).length(2);
    }));


    it('should escape displayed results', inject(function(canvas) {

      // when
      typeText(input_node, 'html');

      // then
      var result_nodes = domQueryAll(SearchPad.RESULT_SELECTOR, canvas.getContainer());

      expect(result_nodes).to.have.length(1);
      expect(result_nodes[0].innerHTML).not.to.contain('<html/>');
    }));


    it('should preselect first result', inject(function(canvas, selection) {

      // when
      typeText(input_node, 'two');

      // then
      var result_nodes = domQueryAll(SearchPad.RESULT_SELECTOR, canvas.getContainer());
      expect(domClasses(result_nodes[0]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.true;
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.preselected ]);
      expect(selection.isSelected(elements.two.a)).to.be.true;
      expect(domClasses(canvas.getGraphics(elements.two.a)).has('djs-search-preselected')).to.be.true;
    }));


    it('should select result on enter', inject(function(canvas, selection) {

      // given
      typeText(input_node, 'two');

      // when
      triggerKeyEvent(input_node, 'keyup', 'Enter');

      // then
      expect(capturedEvents).to.eql([
        EVENTS.opened,
        EVENTS.preselected,
        EVENTS.closed,
        EVENTS.selected
      ]);

      expect(selection.isSelected(elements.two.a)).to.be.true;
      expect(domClasses(canvas.getGraphics(elements.two.a)).has('djs-search-preselected')).to.be.false;
    }));


    it('should reset selection on escape without enter', inject(function(canvas, selection) {

      // given
      selection.select(elements.one.a);

      typeText(input_node, 'two');

      expect(selection.isSelected(elements.one.a)).to.be.false;

      // when
      triggerKeyEvent(input_node, 'keyup', 'Escape');

      // then
      expect(selection.isSelected(elements.one.a)).to.be.true;

      expect(domClasses(canvas.getGraphics(elements.two.a)).has('djs-search-preselected')).to.be.false;
    }));


    it('select should scroll element into view', inject(function(canvas) {

      // given
      typeText(input_node, 'one');

      var container = canvas.getContainer();
      container.style.width = '1000px';
      container.style.height = '1000px';

      canvas.viewbox({
        x: 1000,
        y: 1000,
        width: 1000,
        height: 1000
      });

      // when
      triggerKeyEvent(input_node, 'keyup', 'Enter');

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox).to.have.property('x', -100);
      expect(newViewbox).to.have.property('y', -300);
    }));


    it('select reset viewbox on escape without enter', inject(function(canvas) {

      // given
      var viewbox = canvas.viewbox();

      typeText(input_node, 'two');

      expect(canvas.viewbox()).not.to.eql(viewbox);

      // when
      triggerKeyEvent(input_node, 'keyup', 'Escape');

      // then
      expect(canvas.viewbox()).to.eql(viewbox);
    }));


    it('should reset root element on escape without enter', inject(function(canvas, selection) {

      // given
      selection.select(elements.one.a);

      expect(canvas.getRootElement()).to.equal(rootElements.rootA);

      typeText(input_node, 'two-b');

      expect(canvas.getRootElement()).to.equal(rootElements.rootB);

      // when
      triggerKeyEvent(input_node, 'keyup', 'Escape');

      // then
      expect(canvas.getRootElement()).to.equal(rootElements.rootA);
    }));


    it('select should apply selection on an element', inject(function(selection) {

      // given
      typeText(input_node, 'one');

      // when
      triggerKeyEvent(input_node, 'keyup', 'Enter');

      // then
      expect(selection.isSelected(elements.one.a)).to.be.true;
    }));


    it('should close on escape', inject(function(searchPad) {

      // when
      triggerKeyEvent(input_node, 'keyup', 'Escape');

      // then
      expect(searchPad.isOpen()).to.equal(false);
      expect(capturedEvents).to.eql([ EVENTS.opened, EVENTS.restored, EVENTS.closed ]);
    }));


    it('should preselect next/previus results on arrow down/up', inject(function(canvas) {

      // given
      typeText(input_node, 'two');
      var result_nodes = domQueryAll(SearchPad.RESULT_SELECTOR, canvas.getContainer());

      // when press 'down'
      triggerKeyEvent(input_node, 'keyup', 'ArrowDown');

      // then
      expect(domClasses(result_nodes[0]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.false;
      expect(domClasses(result_nodes[1]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.true;

      // when press 'up'
      triggerKeyEvent(input_node, 'keyup', 'ArrowUp');

      // then
      expect(domClasses(result_nodes[0]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.true;
      expect(domClasses(result_nodes[1]).has(SearchPad.RESULT_SELECTED_CLASS)).to.be.false;

      expect(capturedEvents).to.eql([
        EVENTS.opened,
        EVENTS.preselected,
        EVENTS.preselected,
        EVENTS.preselected
      ]);
    }));


    it('should not move input cursor on arrow down', function() {

      // given
      typeText(input_node, 'two');

      // when press 'down'
      var e = triggerKeyEvent(input_node, 'keydown', 'ArrowDown');
      expect(e.defaultPrevented).to.be.true;
    });


    it('should not move input cursor on arrow up', function() {

      // given
      typeText(input_node, 'two');

      // when press 'up'
      var e = triggerKeyEvent(input_node, 'keydown', 'ArrowUp');
      expect(e.defaultPrevented).to.be.true;
    });


    it('should not search while navigating text in input box left', function() {

      // given
      var find = sinon.spy(searchProvider, 'find');
      typeText(input_node, 'two');

      // when press 'left'
      triggerKeyEvent(input_node, 'keyup', 'ArrowLeft');

      // then
      expect(find).callCount('two'.length);
    });


    it('should not search while navigating text in input box right', function() {

      // given
      var find = sinon.spy(searchProvider, 'find');
      typeText(input_node, 'two');

      // when press 'right'
      triggerKeyEvent(input_node, 'keyup', 'ArrowRight');

      // then
      expect(find).callCount('two'.length);
    });

  });


  describe('a11y', function() {

    it('should have label for search input', inject(function(canvas) {

      // given
      var input = domQuery(SearchPad.INPUT_SELECTOR, canvas.getContainer());

      // then
      expect(input.getAttribute('aria-label')).to.eql('Search in diagram');
    }));
  });
});


function triggerMouseEvent(element, eventType, x, y) {
  var event = new MouseEvent(eventType, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y
  });

  element.dispatchEvent(event);

  return event;
}


function triggerKeyEvent(element, eventType, code) {
  var event = createKeyEvent(code, { type: eventType });

  element.dispatchEvent(event);

  return event;
}


function typeText(element, text) {
  var input = text.split('');

  element.value = '';

  input.forEach(function(c) {
    element.value += c;
    triggerKeyEvent(element, 'keyup', c.charCodeAt(0));
  });
}
