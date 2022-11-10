import { bootstrapDiagram, getDiagramJS, inject } from 'test/TestHelper';

import { assign, isFunction } from 'min-dash';

import {
  query as domQuery,
  classes as domClasses
} from 'min-dom';

import { createEvent as globalEvent } from '../../../util/MockEvents';

import popupMenuModule from 'lib/features/popup-menu';
import modelingModule from 'lib/features/modeling';


describe('features/popup-menu', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      popupMenuModule,
      modelingModule
    ]
  }));

  var menuProvider = new Provider(
    {
      'entry2': { label: 'foo' },
      'entry3': { label: 'bar' }
    },
    {
      'entry1': { label: 'foo' }
    }
  );

  var betterMenuProvider = new Provider(
    { entryB: { label: 'B' } },
    { entryA: { label: 'A' } }
  );

  describe('bootstrap', function() {

    it('overlay to be defined', inject(function(popupMenu) {
      expect(popupMenu).to.exist;
      expect(popupMenu.open).to.exist;
    }));

  });


  describe('#registerProvider', function() {

    it('should add provider', inject(function(popupMenu) {

      // given
      var entriesSpy = sinon.spy(function() {
        return {};
      });

      var provider = new Provider(entriesSpy);

      // when
      popupMenu.registerProvider('provider', provider);
      popupMenu.open({}, 'provider', {});

      // then
      expect(entriesSpy).to.be.calledOnce;
    }));


    it('should add two providers', inject(function(popupMenu) {

      // given
      var entriesSpy = sinon.spy(function() {
        return {};
      });

      var provider1 = new Provider(entriesSpy),
          provider2 = new Provider(entriesSpy);

      // when
      popupMenu.registerProvider('provider1', provider1);
      popupMenu.registerProvider('provider2', provider2);

      popupMenu.open({}, 'provider1', {});
      popupMenu.open({}, 'provider2', {});

      // then
      expect(entriesSpy).to.be.calledTwice;
    }));


    it('should add multiple providers for the same id', inject(function(popupMenu) {

      // given
      var entriesSpy = sinon.spy(function() {
        return {};
      });

      var provider1 = new Provider(entriesSpy),
          provider2 = new Provider(entriesSpy);

      // when
      popupMenu.registerProvider('provider', provider1);
      popupMenu.registerProvider('provider', provider2);

      popupMenu.open({}, 'provider', {});

      // then
      expect(entriesSpy).to.be.calledTwice;
    }));


    describe('ordering', function() {

      function updater() {
        return function() {
          return {};
        };
      }

      var plainProvider = new Provider({ entryA: { action: function() {} } }),
          updatingProvider = new Provider(updater);


      it('should call providers by registration order per default', inject(function(popupMenu) {

        // given
        popupMenu.registerProvider('menu', plainProvider);
        popupMenu.registerProvider('menu', updatingProvider);

        // when
        var isEmpty = popupMenu.isEmpty({}, 'menu');

        // then
        expect(isEmpty).to.be.true;
      }));


      it('should call providers by priority', inject(function(popupMenu) {

        // given
        popupMenu.registerProvider('menu', plainProvider);
        popupMenu.registerProvider('menu', 1200, updatingProvider);

        // when
        var isEmpty = popupMenu.isEmpty({}, 'menu');

        // then
        expect(isEmpty).to.be.false;
      }));
    });

  });


  describe('#isEmpty', function() {

    it('should return true if empty', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('empty-menu', new Provider({}, {}));

      // then
      expect(popupMenu.isEmpty({}, 'empty-menu')).to.be.true;
    }));


    it('should return true if there are no providers', inject(function(popupMenu) {

      // then
      expect(popupMenu.isEmpty({}, 'empty-menu')).to.be.true;
    }));


    it('should return false if entries', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('entry-menu', new Provider({ singleEntry: {} }));

      // then
      expect(popupMenu.isEmpty({}, 'entry-menu')).to.be.false;
    }));


    it('should return false if there are only header entries', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('header-entry-menu', new Provider({}, { singleEntry: {} }));

      // then
      expect(popupMenu.isEmpty({}, 'header-entry-menu')).to.be.false;
    }));


    it('should throw error when provider id is missing', inject(
      function(popupMenu) {

        // then
        expect(function() {
          popupMenu.isEmpty({});
        }).to.throw('providerId parameter is missing');
      }
    ));


    it('should throw error when element is missing', inject(
      function(popupMenu) {

        // then
        expect(function() {
          popupMenu.isEmpty();
        }).to.throw('element parameter is missing');
      }
    ));

  });


  describe('#open', function() {

    beforeEach(inject(function(popupMenu) {
      popupMenu.registerProvider('menu', menuProvider);
    }));


    it('should open', inject(function(popupMenu, eventBus) {

      // given
      var openSpy = sinon.spy();

      eventBus.on('popupMenu.open', openSpy);

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      expect(popupMenu._current).to.exist;
      expect(openSpy).to.have.been.calledOnce;
    }));


    it('should attach popup to html', inject(function(popupMenu) {

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      var container = popupMenu._current.container;
      var popup = container.children[0];

      // then
      expect(domClasses(container).has('djs-popup-parent')).to.be.true;
      expect(domClasses(popup).has('djs-popup')).to.be.true;
      expect(domClasses(popup).has('menu')).to.be.true;
    }));


    it('should add entries to menu', inject(function(popupMenu) {

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      // check this
      var domEntry = queryEntry(popupMenu, 'entry2');

      expect(domEntry.textContent).to.eql('foo');
    }));


    it('should add `data-popup` to popup menu container', inject(function(
        popupMenu
    ) {

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      var container = getPopupContainer(popupMenu);

      expect(container.dataset).to.have.property('popup', 'menu');
    }));


    it('should throw error when no provider', inject(function(popupMenu) {

      // when not registering a provider

      // then
      expect(function() {
        popupMenu.open({}, 'foo', { x: 100, y: 100 });
      }).to.throw('No registered providers for: foo');

    }));


    it('should throw error when element is missing', inject(function(popupMenu) {

      popupMenu.registerProvider('menu', menuProvider);

      expect(function() {
        popupMenu.open();
      }).to.throw('Element is missing');

    }));


    describe('multiple providers', function() {

      beforeEach(inject(function(popupMenu) {
        popupMenu.registerProvider('better-menu', betterMenuProvider);
      }));

      it('should open first menu', inject(function(popupMenu, eventBus) {

        // given
        var openSpy = sinon.spy();

        eventBus.on('popupMenu.open', openSpy);

        // when
        popupMenu.open({}, 'menu', { x: 100, y: 100 });

        // then

        expect(popupMenu._current).to.exist;
        expect(popupMenu._current.headerEntries).to.have.keys('entry1');
        expect(popupMenu._current.entries).to.have.keys('entry2', 'entry3');
      }));

      it('should open second menu', inject(function(popupMenu, eventBus) {

        // given
        var openSpy = sinon.spy();

        eventBus.on('popupMenu.open', openSpy);

        // when
        popupMenu.open({}, 'better-menu', { x: 100, y: 100 });

        // then
        expect(popupMenu._current).to.exist;
        expect(popupMenu._current.entries).to.have.keys('entryB');
        expect(popupMenu._current.headerEntries).to.have.keys('entryA');

      }));
    });
  });

  describe('#close', function() {

    beforeEach(inject(function(popupMenu) {
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.open({}, 'menu' ,{ x: 100, y: 100 });
    }));


    it('should close', inject(function(popupMenu, eventBus) {

      // given
      var closeSpy = sinon.spy();

      eventBus.on('popupMenu.close', closeSpy);

      // when
      popupMenu.close();

      // then
      var open = popupMenu.isOpen();

      expect(open).to.be.false;

      expect(closeSpy).to.have.been.calledOnce;
    }));


    it('should not fail if already closed', inject(function(popupMenu) {

      // when
      popupMenu.close();

      // then
      expect(function() {
        popupMenu.close();
      }).not.to.throw();
    }));

  });


  describe('#isOpen', function() {

    it('should not be open initially', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('menu', menuProvider);

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));


    it('should be open after opening', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      expect(popupMenu.isOpen()).to.be.true;
    }));


    it('should be closed after closing', inject(function(popupMenu) {

      // given
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // when
      popupMenu.close();

      // then
      expect(popupMenu.isOpen()).to.be.false;
    }));

  });


  describe('#trigger', function() {

    it('should trigger the right action handler', inject(function(popupMenu) {

      // given
      popupMenu.registerProvider('test-menu', {
        getEntries: function() {
          return [
            {
              id: '1',
              label: 'Entry 1',
              className: 'Entry_1',
              action: function(event, entry) {
                return 'Entry 1';
              }
            },
            {
              id: '2',
              label: 'Entry 2',
              className: 'Entry_2',
              action: function(event, entry) {
                return 'Entry 2';
              }
            }
          ];
        }
      });

      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      var entry = queryPopup(popupMenu, "[data-id='2']");

      // when
      var trigger = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(trigger).to.eql('Entry 2');
    }));

  });


  describe('with updater', function() {

    it('should allow to add entries', inject(function(popupMenu) {

      // given
      var plainProvider = new Provider({ entryA: { className: 'plain' } }),
          updatingProvider = new Provider(function() {
            return function(entries) {
              return assign(entries, { entryB: { className: 'updating' } });
            };
          });

      popupMenu.registerProvider('menu', plainProvider);
      popupMenu.registerProvider('menu', updatingProvider);

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      var first = queryPopup(popupMenu, '.plain'),
          second = queryPopup(popupMenu, '.updating');

      expect(first).to.exist;
      expect(second).to.exist;
    }));


    it('should allow to add header entries', inject(function(popupMenu) {

      // given
      var headerEntriesProvider = new Provider(null, function() {
        return function(entries) {
          return assign(entries, { entryB: { className: 'header' } });
        };
      });

      popupMenu.registerProvider('menu', headerEntriesProvider);

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      var element = queryPopup(popupMenu, '.header');

      expect(element).to.exist;
    }));


    it('should allow to update entries', inject(function(popupMenu) {

      // given
      var plainProvider = new Provider({ entryA: { action: function() {} } }),
          updatingProvider = new Provider(function() {
            return function(entries) {
              return assign(entries, { entryA: { className: 'special-entry' } });
            };
          });

      popupMenu.registerProvider('menu', plainProvider);
      popupMenu.registerProvider('menu', updatingProvider);

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      var element = queryPopup(popupMenu, '.special-entry');

      expect(element).to.exist;
    }));


    it('should allow to remove entries', inject(function(popupMenu) {

      // given
      var plainProvider = new Provider({ entryA: {} }),
          updatingProvider = new Provider(function() {
            return function(entries) {
              return {};
            };
          });

      popupMenu.registerProvider('menu', plainProvider);
      popupMenu.registerProvider('menu', updatingProvider);

      // when
      var isEmpty = popupMenu.isEmpty({}, 'menu');

      // then
      expect(isEmpty).to.be.true;
    }));
  });


  describe('integration', function() {

    describe('events', function() {

      afterEach(sinon.restore);

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        popupMenu.open({}, 'menu', { x: 100, y: 100 });

        // when
        eventBus.fire('contextPad.close');

        // then
        var open = popupMenu.isOpen();

        expect(open).to.be.false;
      }));


      it('should close menu (canvas.viewbox.changing)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        popupMenu.open({}, 'menu', { x: 100, y: 100 });

        // when
        eventBus.fire('canvas.viewbox.changing');

        // then
        var open = popupMenu.isOpen();

        expect(open).to.be.false;
      }));


      it('should correctly unsubscribe when closed via #close', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        popupMenu.open({}, 'menu', { x: 100, y: 100 });
        popupMenu.close();

        var spy = sinon.spy(popupMenu, 'close');

        // when
        eventBus.fire('canvas.viewbox.changing');

        // then
        expect(spy).to.not.have.been.called;
      }));

    });
  });


  describe('header', function() {

    it('should throw an error, if the id of a header entry is not set', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('test-menu', {
        getEntries: function() {
          return [ { label: 'foo' } ];
        }
      });

      // then
      expect(function() {
        popupMenu.open({}, 'test-menu', { x: 100, y: 100 });
      }).to.throw('every entry must have the id property set');
    }));

  });


  // different browsers, different outcomes
  describe('position', function() {

    beforeEach(inject(function(popupMenu, elementRegistry) {

      var customProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2', active: true },
            { id: '3', label: 'Entry 3' },
            { id: '4', label: 'Entry 4', disabled: true },
            { id: '5', label: 'Entry 5' }
          ];
        },
        getHeaderEntries: function() {
          return [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
            { id: 'C', label: 'C', active: true },
            { id: 'D', label: 'D', disabled: true },
            { id: 'E', label: 'E', disabled: true }
          ];
        }
      };

      popupMenu.registerProvider('custom-provider', customProvider);

    }));


    it('should throw an error if the position argument is missing', inject(function(popupMenu) {

      popupMenu.registerProvider('menu', menuProvider);

      // then
      expect(function() {
        popupMenu.open({}, 'menu');
      }).to.throw('the position argument is missing');
    }
    ));


    it('should open within bounds above', inject(function(popupMenu, canvas) {

      // given
      var documentBounds = document.documentElement.getBoundingClientRect();

      var y = documentBounds.height - 40;

      var cursorPosition = { x: documentBounds.left + 100, y: documentBounds.top + y };

      // when
      popupMenu.open({}, 'custom-provider', cursorPosition);

      var menu = domQuery('.djs-popup .overlay', popupMenu._current.container);

      var menuDimensions = {
        width: menu.scrollWidth,
        height: menu.scrollHeight
      };

      // then
      expect(menu.offsetTop).to.be.closeTo(y - menuDimensions.height, 1);
    }));


    it('should open within bounds above (limited client rect height)', inject(

      function(popupMenu, canvas) {

        // given
        // limited client rect height
        document.body.style.height = '200px';

        var documentBounds = document.documentElement.getBoundingClientRect();

        var cursorPosition = { x: documentBounds.left + 10, y: documentBounds.top + 150 };

        // when
        popupMenu.open({}, 'custom-provider', { x: 100, y: 150, cursor: cursorPosition });

        var menu = domQuery('.djs-popup .overlay', popupMenu._current.container);

        // then
        expect(menu.offsetTop).to.equal(10);
      }
    ));


    it('should open within bounds to the left', inject(function(popupMenu, canvas) {

      // given
      var documentBounds = document.documentElement.getBoundingClientRect();

      var cursorPosition = { x: documentBounds.right, y: documentBounds.top + 100 };

      // when
      popupMenu.open({}, 'custom-provider', cursorPosition);

      var menu = domQuery('.djs-popup .overlay', popupMenu._current.container);

      var menuDimensions = {
        width: menu.scrollWidth,
        height: menu.scrollHeight
      };

      expect(menu.offsetLeft).to.be.closeTo(documentBounds.right - menuDimensions.width, 2);
    }));

  });


  describe('scaling', function() {

    var NUM_REGEX = /([+-]?\d*[.]?\d+)(?=,|\))/g;
    var zoomLevels = [ 1.0, 1.2, 3.5, 10, 0.5 ];

    function asVector(scaleStr) {
      if (scaleStr && scaleStr !== 'none') {
        var m = scaleStr.match(NUM_REGEX);

        var x = parseFloat(m[0], 10);
        var y = m[1] ? parseFloat(m[1], 10) : x;

        return {
          x: x,
          y: y
        };
      }
    }

    function scaleVector(element) {
      return asVector(element.style.transform);
    }

    function verifyScales(expectedScales) {

      getDiagramJS().invoke(function(canvas, popupMenu) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        // test multiple zoom steps
        zoomLevels.forEach(function(zoom, index) {

          var expectedScale = expectedScales[index];

          // when
          canvas.zoom(zoom);

          popupMenu.open({}, 'menu', { x: 100, y: 100 });

          var menu = domQuery('.djs-popup .overlay', popupMenu._current.container);

          var actualScale = scaleVector(menu) || { x: 1, y: 1 };

          // then
          expect(actualScale.x).to.eql(actualScale.y);
          expect(actualScale.x).to.be.closeTo(expectedScale, 0.00001);
        });
      });
    }

    it('should scale within [ 1.0, 1.5 ] by default', function() {

      // given
      var expectedScales = [ 1.0, 1.2, 1.5, 1.5, 1.0 ];

      bootstrapDiagram({
        modules: [
          popupMenuModule,
          modelingModule
        ]
      })();

      // when
      verifyScales(expectedScales);
    });

    it('should scale within [ 1.0, 1.5 ] without scale config', function() {

      // given
      var expectedScales = [ 1.0, 1.2, 1.5, 1.5, 1.0 ];

      bootstrapDiagram({
        modules: [
          popupMenuModule,
          modelingModule
        ],
        popupMenu: {}
      })();

      // when
      verifyScales(expectedScales);
    });

    it('should scale within the limits set in config', function() {

      // given
      var config = {
        scale: {
          min: 1.0,
          max: 1.2
        }
      };

      var expectedScales = [ 1.0, 1.2, 1.2, 1.2, 1.0 ];

      bootstrapDiagram({
        modules: [
          popupMenuModule,
          modelingModule
        ],
        popupMenu: config
      })();

      // when
      verifyScales(expectedScales);
    });

    it('should scale with scale = true', function() {

      // given
      var config = {
        scale: true
      };

      var expectedScales = zoomLevels;

      bootstrapDiagram({
        modules: [
          popupMenuModule,
          modelingModule
        ],
        popupMenu: config
      })();

      // when
      verifyScales(expectedScales);
    });

    it('should not scale with scale = false', function() {

      // given
      var config = {
        scale: false
      };

      var expectedScales = [ 1.0, 1.0, 1.0, 1.0, 1.0 ];

      bootstrapDiagram({
        modules: [
          popupMenuModule,
          modelingModule
        ],
        popupMenu: config
      })();

      // when
      verifyScales(expectedScales);
    });

  });


  describe('legacy providers', function() {

    function LegacyProvider(entries, headerEntries) {
      this.getEntries = isFunction(entries)
        ? entries
        : function() {
          return entries || [];
        };

      if (headerEntries) {
        this.getHeaderEntries = isFunction(headerEntries)
          ? headerEntries
          : function() {
            return headerEntries;
          };
      }
    }


    it('should add provider', inject(function(popupMenu) {

      // given
      var provider = new LegacyProvider();

      // then
      popupMenu.registerProvider('provider', provider);
    }));


    it('should return true for isEmpty if no entries', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('entry-menu', new LegacyProvider());

      // then
      expect(popupMenu.isEmpty({}, 'entry-menu')).to.be.true;
    }));


    it('should return false for isEmpty if entries', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider(
        'entry-menu',
        new LegacyProvider([ { id: 'singleEntry' } ])
      );

      // then
      expect(popupMenu.isEmpty({}, 'entry-menu')).to.be.false;
    }));


    it('should open', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      expect(popupMenu.isOpen()).to.be.true;

    }));


    beforeEach(inject(function(popupMenu) {}));


    it('should close', inject(function(popupMenu, eventBus) {

      // given
      popupMenu.registerProvider('menu', new LegacyProvider());
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      var closeSpy = sinon.spy();

      eventBus.on('popupMenu.close', closeSpy);

      // when
      popupMenu.close();

      // then
      var open = popupMenu.isOpen();

      expect(open).to.be.false;

      expect(closeSpy).to.have.been.calledOnce;
    }));


    it('should trigger action handler', inject(function(popupMenu) {

      // given
      var entries = [
        {
          id: '1',
          label: 'Entry 1',
          className: 'Entry_1',
          action: function() {
            return 'Entry 1';
          }
        }
      ];

      popupMenu.registerProvider('test-menu', new LegacyProvider(entries));

      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      var entry = queryPopup(popupMenu, '[data-id="1"]');

      // when
      var trigger = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(trigger).to.eql('Entry 1');
    }));


    it('should throw an error, if the id of a header entry is not set', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider(
        'test-menu',
        new LegacyProvider([ { label: 'foo' } ])
      );

      // then
      expect(function() {
        popupMenu.open({}, 'test-menu', { x: 100, y: 100 });
      }).to.throw('every entry must have the id property set');
    }));


    it('should throw an error, if the id of an entry is not set', inject(function(
        popupMenu
    ) {

      // when
      popupMenu.registerProvider(
        'test-menu',
        new LegacyProvider(null, [ { label: 'foo' } ])
      );

      // then
      expect(function() {
        popupMenu.open({}, 'test-menu', { x: 100, y: 100 });
      }).to.throw('every entry must have the id property set');
    }));

  });

});


// helper ////
function Provider(entries, headerEntries) {
  this.getPopupMenuEntries = isFunction(entries)
    ? entries
    : function() {
      return entries || {};
    };

  if (headerEntries) {
    this.getPopupMenuHeaderEntries = isFunction(headerEntries)
      ? headerEntries
      : function() {
        return headerEntries;
      };
  }
}

function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, getPopupContainer(popupMenu));
}

function getPopupContainer(popupMenu) {
  return popupMenu._current.container;
}