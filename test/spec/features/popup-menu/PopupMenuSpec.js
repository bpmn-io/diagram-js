/* global sinon */

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

var fs = require('fs');

import {
  query as domQuery,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

import { createEvent as globalEvent } from '../../../util/MockEvents';

import popupMenuModule from 'lib/features/popup-menu';
import modelingModule from 'lib/features/modeling';


function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

var menuProvider = {
  getHeaderEntries: function() {
    return [
      { id: 'entry1', label: 'foo' }
    ];
  },
  getEntries: function() {
    return [
      { id: 'entry2', label: 'foo' },
      { id: 'entry3', label: 'bar' }
    ];
  }
};

var betterMenuProvider = {
  getHeaderEntries: function() {
    return [
      { id: 'entryA', label: 'A' }
    ];
  },
  getEntries: function() {
    return [
      { id: 'entryB', label: 'B' }
    ];
  }
};



describe('features/popup', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      popupMenuModule,
      modelingModule
    ]
  }));

  describe('bootstrap', function() {

    it('overlay to be defined', inject(function(popupMenu) {
      expect(popupMenu).to.exist;
      expect(popupMenu.open).to.exist;
    }));

  });


  describe('#registerProvider', function() {

    it('should add provider', inject(function(popupMenu) {

      // given
      var provider = {};

      // when
      popupMenu.registerProvider('provider', provider);

      // then
      expect(popupMenu._providers.provider).to.exist;

    }));


    it('should add two providers', inject(function(popupMenu) {

      // given
      var provider1 = {};
      var provider2 = {};

      // when
      popupMenu.registerProvider('provider1', provider1);
      popupMenu.registerProvider('provider2', provider2);

      // then
      expect(popupMenu._providers.provider1).to.exist;
      expect(popupMenu._providers.provider2).to.exist;

    }));

  });


  describe('#isEmpty', function() {

    it('should return true if empty', inject(function(popupMenu) {
      // when
      popupMenu.registerProvider('empty-menu', {
        getEntries: function() { return []; },
        getHeaderEntries: function() { return []; }
      });

      // then
      expect(popupMenu.isEmpty({}, 'empty-menu')).to.be.true;
    }));


    it('should return false if entries', inject(function(popupMenu) {
      // when
      popupMenu.registerProvider('entry-menu', {
        getEntries: function() { return [ { id: 1 } ]; }
      });

      // then
      expect(popupMenu.isEmpty({}, 'entry-menu')).to.be.false;
    }));


    it('should return false if header entries', inject(function(popupMenu) {
      // when
      popupMenu.registerProvider('header-entry-menu', {
        getEntries: function() { return [ { id: 1 } ]; }
      });

      // then
      expect(popupMenu.isEmpty({}, 'header-entry-menu')).to.be.false;
    }));


    it('should throw error when provider id is missing', inject(
      function(popupMenu) {
        // when
        popupMenu.registerProvider('header-entry-menu', {
          getEntries: function() { return [ { id: 1 } ]; }
        });

        // then
        expect(function() {
          popupMenu.isEmpty({});
        }).to.throw('providerId parameter is missing');
      }
    ));


    it('should throw error when element is missing', inject(
      function(popupMenu) {
        // when
        popupMenu.registerProvider('header-entry-menu', {
          getEntries: function() { return [ { id: 1 } ]; }
        });

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
      popupMenu.open({}, 'menu' ,{ x: 100, y: 100 });

      var container = popupMenu._current.container;

      // then
      expect(domClasses(container).has('djs-popup')).to.be.true;
      expect(domClasses(container).has('menu')).to.be.true;
    }));


    it('should add entries to menu', inject(function(popupMenu) {

      // when
      popupMenu.open({}, 'menu' ,{ x: 100, y: 100 });

      // then
      var domEntry = queryEntry(popupMenu, 'entry1');

      expect(domEntry.textContent).to.eql('foo');
    }));


    it('should add action-id to entry', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('item-menu', {
        getEntries: function() {
          return [
            { id: 'save', label: 'SAVE' },
            { id: 'load', label: 'LOAD' },
            { id: 'undo', label: 'UNDO' }
          ];
        },
        getHeaderEntries: function() {}
      });

      popupMenu.open({}, 'item-menu' ,{ x: 100, y: 100 });

      // then
      var parent = queryPopup(popupMenu, '.djs-popup-body');
      var entry1 = parent.childNodes[0];
      var entry2 = parent.childNodes[1];
      var entry3 = parent.childNodes[2];

      expect(entry1.getAttribute('data-id')).to.eql('save');
      expect(entry2.getAttribute('data-id')).to.eql('load');
      expect(entry3.getAttribute('data-id')).to.eql('undo');
    }));


    it('should open menu for specific element', inject(function(popupMenu) {

      // when
      popupMenu.registerProvider('menu', menuProvider);

      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      var currentProvider = popupMenu._current.provider;

      // then
      expect(currentProvider.getHeaderEntries()).to.deep.include({
        id: 'entry1',
        label: 'foo'
      });

      expect(currentProvider.getEntries()).to.deep.include({
        id: 'entry2',
        label: 'foo'
      });

    }));


    it('should throw error when no provider', inject(function(popupMenu) {

      // when not registering a provider

      // then
      expect(function() {
        popupMenu.open({}, 'foo', { x: 100, y: 100 });
      }).to.throw('Provider is not registered: foo');

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
        expect(popupMenu._current.headerEntries[0].id).to.eql('entry1');
        expect(popupMenu._current.entries[0].id).to.eql('entry2');

      }));


      it('should open second menu', inject(function(popupMenu, eventBus) {

        // given
        var openSpy = sinon.spy();

        eventBus.on('popupMenu.open', openSpy);

        // when
        popupMenu.open({}, 'better-menu', { x: 100, y: 100 });

        // then
        expect(popupMenu._current).to.exist;
        expect(popupMenu._current.headerEntries[0].id).to.eql('entryA');
        expect(popupMenu._current.entries[0].id).to.eql('entryB');
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
      expect(popupMenu.close).not.to.throw;
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
      popupMenu.open({}, 'menu' ,{ x: 100, y: 100 });

      // then
      expect(popupMenu.isOpen()).to.be.true;
    }));


    it('should be closed after closing', inject(function(popupMenu) {

      // given
      popupMenu.registerProvider('menu', menuProvider);
      popupMenu.open({}, 'menu' ,{ x: 100, y: 100 });

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
            }, {
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

      popupMenu.open({}, 'test-menu' ,{ x: 100, y: 100 });

      var entry = queryPopup(popupMenu, '.Entry_2');

      // when
      var trigger = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(trigger).to.eql('Entry 2');
    }));

  });


  describe('integration', function() {

    describe('events', function() {

      it('should close menu (contextPad.close)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        popupMenu.open({}, 'menu' ,{ x: 100, y: 100 });

        // when
        eventBus.fire('contextPad.close');

        // then
        var open = popupMenu.isOpen();

        expect(open).to.be.false;
      }));


      it('should close menu (canvas.viewbox.changing)', inject(function(popupMenu, eventBus) {

        // given
        popupMenu.registerProvider('menu', menuProvider);

        popupMenu.open({}, 'menu' ,{ x: 100, y: 100 });

        // when
        eventBus.fire('canvas.viewbox.changing');

        // then
        var open = popupMenu.isOpen();

        expect(open).to.be.false;
      }));

    });

  });


  describe('menu styling', function() {

    it('should add standard class to entry', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.open({}, 'test-menu' ,{ x: 100, y: 100 });

      // then
      var elements = domQueryAll('.entry', popupMenu._current.container);

      expect(elements.length).to.eql(2);
    }));


    it('should add custom class to entry if specfied', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            {
              id: '1',
              label: 'Entry 1'
            },
            {
              id: '2',
              label: 'Entry 2 - special',
              className: 'special-entry cls2 cls3'
            }
          ];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.open({}, 'test-menu' ,{ x: 100, y: 100 });

      // then
      var element = queryPopup(popupMenu, '.special-entry');

      expect(element.textContent).to.eql('Entry 2 - special');
      expect(element.className).to.eql('entry special-entry cls2 cls3');
    }));


    it('should name the css classes correctly', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            { id: '1', label: 'Entry 1' },
            { id: '2', label: 'Entry 2' }
          ];
        },
        getHeaderEntries: function() {
          return [{ id: 'A', label: 'Header Entry A' }];
        }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.open({}, 'test-menu' ,{ x: 100, y: 100 });

      var popupBody = queryPopup(popupMenu, '.djs-popup-body');
      var popupHeader = queryPopup(popupMenu, '.djs-popup-header');

      // then
      expect(domQueryAll('.entry', popupBody).length).to.eql(2);
      expect(domQueryAll('.entry', popupHeader).length).to.eql(1);
    }));


    it('should look awesome', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
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

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.open({}, 'test-menu' ,{ x: 100, y: 100 });

      // then
      // looks awesome?
    }));

  });


  describe('singleton handling', function() {

    it('should update the popup menu, when it is opened again' , inject(
      function(popupMenu) {

        // given
        var popupMenu1 = {
          getEntries: function() {
            return [
              { id: '1', label: 'Entry 1' },
              { id: '2', label: 'Entry 2' }
            ];
          }
        };

        popupMenu.registerProvider('popup-menu1', popupMenu1);

        var popupMenu2 = {
          getEntries: function() {
            return [
              { id: '3', label: 'Entry A' },
              { id: '4', label: 'Entry B' }
            ];
          }
        };

        popupMenu.registerProvider('popup-menu2', popupMenu2);

        // when
        popupMenu.open({}, 'popup-menu1', { x: 100, y: 100 });
        popupMenu.open({}, 'popup-menu2', { x: 200, y: 200 });

        var container = popupMenu._current.container,
            entriesContainer = domQuery('.djs-popup-body', container);

        // then
        expect(domQuery('.popup-menu1', document)).to.be.null;
        expect(domQuery('.popup-menu2', document)).not.to.be.null;

        expect(domClasses(container).has('popup-menu2')).to.be.true;

        expect(container.style.left).to.eql('200px');
        expect(container.style.top).to.eql('200px');

        expect(entriesContainer.childNodes[0].textContent).to.eql('Entry A');
        expect(entriesContainer.childNodes[1].textContent).to.eql('Entry B');
      }
    ));

  });


  describe('header', function() {

    it('should throw an error, if the id of a header entry is not set', inject(
      function(popupMenu) {

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
      }
    ));


    it('should be attached to the top of the popup menu, if set' , inject(
      function(popupMenu) {

        // when
        popupMenu.registerProvider('menu', menuProvider);
        popupMenu.open({}, 'menu', { x: 100, y: 100 });

        // then
        expect(queryPopup(popupMenu, '.djs-popup-header')).to.exist;
      }
    ));


    it('should add a custom css class to the header section, if specified', inject(
      function(popupMenu) {

        var testMenuProvider = {
          getHeaderEntries: function() {
            return [ { id: '1', className: 'header-entry-1' } ];
          },
          getEntries: function() {
            return [ { id: '2', label: 'foo' } ];
          }
        };

        popupMenu.registerProvider('test-menu', testMenuProvider);
        popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

        // then
        expect(queryPopup(popupMenu, '.header-entry-1')).to.exist;
      }
    ));


    it('should add an image to the header section, if specified', inject(function(popupMenu) {

      // given
      var testImage = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/resources/a.png', 'base64');

      var testMenuProvider = {
        getHeaderEntries: function() {
          return [
            {
              id: '1',
              imageUrl: testImage,
              className: 'image-1'
            }
          ];
        },
        getEntries: function() { return []; }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var img = queryPopup(popupMenu, '.image-1 img');

      expect(img).to.exist;
      expect(img.getAttribute('src')).to.eql(testImage);
    }));


    it('should add a labeled element to the header section, if specified', inject(
      function(popupMenu) {

        var testMenuProvider = {
          getHeaderEntries: function() {
            return [ { id: '1', label: 'foo', className: 'label-1' } ];
          },
          getEntries: function() { return []; }
        };

        popupMenu.registerProvider('test-menu', testMenuProvider);
        popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

        // then
        var headerEntry = queryPopup(popupMenu, '.label-1');

        expect(headerEntry.textContent).to.eql('foo');
      }
    ));


    it('should throw an error if the position argument is missing', inject(
      function(popupMenu) {

        popupMenu.registerProvider('menu', menuProvider);

        // then
        expect(function() {
          popupMenu.open({}, 'menu');
        }).to.throw('the position argument is missing');
      }
    ));


    it('should only render body if entries exist', inject(function(popupMenu) {

      // when
      var testMenuProvider = {
        getEntries: function() {
          return [ ]; }
      };

      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      expect(queryPopup(popupMenu, '.djs-popup-header')).not.to.exist;
      expect(queryPopup(popupMenu, '.djs-popup-body')).not.to.exist;
    }));


    it('should trigger action on click', inject(function(popupMenu) {

      // given
      var actionListener = sinon.spy();

      var testProvider = {
        getHeaderEntries: function() {
          return [{
            id: '1',
            action: actionListener,
            label: 'foo'
          }];
        },
        getEntries: function() { return []; }
      };

      popupMenu.registerProvider('test-menu', testProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      var entry = queryPopup(popupMenu, '.entry');

      // when
      popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(actionListener).to.have.been.called;
    }));


    it('should add disabled and active classes', inject(function(popupMenu) {

      // given
      var entry;

      var testMenuProvider = {
        getHeaderEntries: function() {
          return [
            {
              id: 'foo',
              active: true,
              disabled: true,
              label: 'foo'
            }
          ];
        },
        getEntries: function() { return []; }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      entry = queryEntry(popupMenu, 'foo');

      expect(domClasses(entry).has('active')).to.be.true;
      expect(domClasses(entry).has('disabled')).to.be.true;
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


    it('should open within bounds above', inject(function(popupMenu, canvas) {
      // given
      var clientRect = canvas._container.getBoundingClientRect();

      var cursorPosition = { x: clientRect.left + 100, y: clientRect.top + 500 };

      // when
      popupMenu.open({}, 'custom-provider', { x: 100, y: 500, cursor: cursorPosition });

      var menu = popupMenu._current.container;

      var menuDimensions = {
        width: menu.scrollWidth,
        height: menu.scrollHeight
      };

      // then
      expect(menu.offsetTop).to.equal(500 - menuDimensions.height);
    }));


    it('should open within bounds above (limited client rect height)', inject(
      function(popupMenu, canvas) {

        // given
        // limited client rect height
        canvas._container.parentElement.style.height = '200px';

        var clientRect = canvas._container.getBoundingClientRect();

        var cursorPosition = { x: clientRect.left + 10, y: clientRect.top + 150 };

        // when
        popupMenu.open({}, 'custom-provider', { x: 100, y: 150, cursor: cursorPosition });

        var menu = popupMenu._current.container;

        // then
        expect(menu.offsetTop).to.equal(10);
      }
    ));


    it('should open within bounds to the left', inject(function(popupMenu, canvas) {
      // given
      var clientRect = canvas._container.getBoundingClientRect();

      var cursorPosition = { x: clientRect.left + 2000, y: clientRect.top + 100 };

      // when
      popupMenu.open({}, 'custom-provider', { x: 2000, y: 100, cursor: cursorPosition });

      var menu = popupMenu._current.container;

      var menuDimensions = {
        width: menu.scrollWidth,
        height: menu.scrollHeight
      };

      expect(menu.offsetLeft).to.equal(2000 - menuDimensions.width);
    }));

  });

});
