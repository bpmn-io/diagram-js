import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import testImage from './resources/a.png';

import {
  assign,
  isFunction
} from 'min-dash';

import {
  query as domQuery,
  queryAll as domQueryAll,
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

      // then
      expect(domClasses(container).has('djs-popup-parent')).to.be.true;
      expect(domQueryAll('.djs-popup-backdrop', container)).to.have.length(1);
      expect(domQueryAll('.djs-popup', container)).to.have.length(1);

      expect(domClasses(domQuery('.djs-popup', container)).has('menu')).to.be.true;
    }));


    it('should be visible even if no `position.cursor` was passed', inject(function(popupMenu) {

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      var container = popupMenu._current.container;

      // then
      expect(getComputedStyle(container).visibility).not.to.eql('hidden');
    }));


    it('should add entries to menu', inject(function(popupMenu) {

      // when
      popupMenu.open({}, 'menu', { x: 100, y: 100 });

      // then
      var domEntry = queryEntry('entry1');

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

      popupMenu.open({}, 'item-menu', { x: 100, y: 100 });

      // then
      var group = getGroup('default');
      var entry1 = group.childNodes[0];
      var entry2 = group.childNodes[1];
      var entry3 = group.childNodes[2];

      expect(entry1.getAttribute('data-id')).to.eql('save');
      expect(entry2.getAttribute('data-id')).to.eql('load');
      expect(entry3.getAttribute('data-id')).to.eql('undo');
    }));


    it('should add `data-popup` to popup menu container', inject(function(popupMenu) {

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


    describe('grouping', function() {

      it('should group entries', inject(function(popupMenu) {

        // given
        popupMenu.registerProvider('group-menu', {
          getEntries: function() {
            return [
              { id: 'save', label: 'SAVE', group: 'file' },
              { id: 'load', label: 'LOAD', group: 'file' },
              { id: 'undo', label: 'UNDO', group: 'command' },
              { id: 'redo', label: 'REDO', group: 'command' },
              { id: 'clear', label: 'CLEAR' }
            ];
          }
        });

        // when
        popupMenu.open({}, 'group-menu', { x: 100, y: 100 });

        // then
        var parent = queryPopup('.djs-popup-results'),
            group1 = parent.childNodes[0],
            group2 = parent.childNodes[1],
            group3 = parent.childNodes[2];

        expect(group1.dataset).to.have.property('group', 'file');
        expect(group2.dataset).to.have.property('group', 'command');
        expect(group3.dataset).to.have.property('group', 'default');

        expect(group1.childNodes).to.have.lengthOf(2);
        expect(group2.childNodes).to.have.lengthOf(2);
        expect(group3.childNodes).to.have.lengthOf(1);
      }));


      it('should use group <default> if not provided', inject(function(popupMenu) {

        // given
        popupMenu.registerProvider('group-menu', {
          getEntries: function() {
            return [
              { id: 'save', label: 'SAVE' },
              { id: 'load', label: 'LOAD' },
              { id: 'undo', label: 'UNDO' },
              { id: 'redo', label: 'REDO' },
              { id: 'clear', label: 'CLEAR' }
            ];
          }
        });

        // when
        popupMenu.open({}, 'group-menu', { x: 100, y: 100 });

        // then
        var parent = queryPopup('.djs-popup-results'),
            group1 = parent.childNodes[0];

        expect(parent.children).to.have.lengthOf(1);
        expect(group1.dataset).to.have.property('group', 'default');
        expect(group1.children).to.have.lengthOf(5);
      }));


      it('should NOT allow XSS via group', inject(function(popupMenu) {

        // given
        popupMenu.registerProvider('group-menu', {
          getEntries: function() {
            return [
              { id: 'save', label: 'SAVE', group: '"><marquee />' }
            ];
          }
        });

        // when
        popupMenu.open({}, 'group-menu', { x: 100, y: 100 });

        // then
        var injected = queryPopup('marquee');

        expect(injected).not.to.exist;
      }));


      it('should display group name if provided', inject(function(popupMenu) {

        // given
        popupMenu.registerProvider('group-menu', {
          getEntries: function() {
            return [
              { id: 'save', group: { name: 'file' , id: 'file' } },
              { id: 'load', group: { name: 'file' , id: 'file' } },
              { id: 'undo', group: { name: 'command' , id: 'command' } },
              { id: 'redo', group: { name: 'command' , id: 'command' } },
            ];
          } });

        // when
        popupMenu.open({}, 'group-menu', { x: 100, y: 100 });

        const container = getPopupContainer(popupMenu);
        const entryHeaders = domQueryAll('.entry-header', container);

        // then
        expect(entryHeaders).to.have.lengthOf(2);
        expect(entryHeaders[0].textContent).to.eql('file');
        expect(entryHeaders[1].textContent).to.eql('command');
      }));


      it('should support legacy groups (type = string)', inject(function(popupMenu) {

        // given
        popupMenu.registerProvider('group-menu', {
          getEntries: function() {
            return [
              { id: 'save', group: 'file' },
              { id: 'load', group: 'file' }
            ];
          } });

        // when
        popupMenu.open({}, 'group-menu', { x: 100, y: 100 });

        const entryHeaders = queryPopup('[data-group="file"]');

        // then
        expect(entryHeaders).to.exist;
        expect(entryHeaders.children).to.have.lengthOf(2);
      }));

    });


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
      popupMenu.open({}, 'menu', { x: 100, y: 100 });
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


    it('should remove container', inject(function(popupMenu, eventBus) {

      // given
      var closeSpy = sinon.spy();
      var container = popupMenu._current.container;

      eventBus.on('popupMenu.close', closeSpy);

      // assume
      expect(container.parentNode).to.exist;

      // when
      popupMenu.close();

      // then
      expect(popupMenu.isOpen()).to.be.false;

      expect(closeSpy).to.have.been.calledOnce;
      expect(container.parentNode).not.to.exist;
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
            }, {
              id: '2',
              label: 'Entry 2',
              className: 'Entry_2',
              action: function(event, entry) {
                return 'Entry 2';
              }
            }
          ];
        },
        getHeaderEntries: function() {
          return [
            {
              id: '3',
              label: 'Entry 3',
              className: 'Entry_3',
              action: function(event, entry) {
                return 'Entry 3';
              }
            }
          ];
        }
      });

      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      var entry = queryEntry('2');
      var headerEntry = queryEntry('3');

      // when
      var triggerEntry = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));
      var triggerHeaderEntry = popupMenu.trigger(globalEvent(headerEntry, { x: 0, y: 0 }));

      // then
      expect(triggerEntry).to.eql('Entry 2');
      expect(triggerHeaderEntry).to.eql('Entry 3');
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
      var first = queryPopup('.plain'),
          second = queryPopup('.updating');

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
      var element = queryPopup('.header');

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
      var element = queryEntry('entryA');
      expect(element).to.exist;

      var name = domQuery('.djs-popup-entry-name', element);
      expect(domClasses(name).contains('special-entry')).to.be.true;
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


      it('should correctly unsubscribe when closed via #close', inject(
        function(popupMenu, eventBus) {

          // given
          popupMenu.registerProvider('menu', menuProvider);

          popupMenu.open({}, 'menu', { x: 100, y: 100 });
          popupMenu.close();

          var spy = sinon.spy(popupMenu, 'close');

          // when
          eventBus.fire('canvas.viewbox.changing');

          // then
          expect(spy).to.not.have.been.called;
        }
      ));

    });

  });


  describe('entries', function() {

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
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var elements = queryPopupAll('.entry');

      expect(elements).to.have.length(2);
      expect(elements[0]).to.equal(queryEntry('1'));
      expect(elements[1]).to.equal(queryEntry('2'));
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
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var element = queryEntry('2');
      expect(element.textContent).to.eql('Entry 2 - special');

      var name = domQuery('.djs-popup-entry-name', element);
      expect(name.className).to.eql('djs-popup-entry-name special-entry cls2 cls3');
    }));


    it('should name the css classes correctly', inject(function(popupMenu) {

      // given
      var testMenuProvider = new Provider(
        function() {
          return {
            '1': { label: 'Entry 1' },
            '2': { label: 'Entry 2' }
          };
        },
        function() {
          return { 'A': { label: 'Header Entry A' } };
        }
      );

      popupMenu.registerProvider('test-menu', testMenuProvider);

      // when
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      var popupBody = queryPopup('.djs-popup-body');
      var popupHeader = queryPopup('.djs-popup-header');

      // then
      expect(domQueryAll('.djs-popup-body .entry', popupBody)).to.have.length(2);
      expect(domQueryAll('.djs-popup-header .entry', popupHeader)).to.have.length(1);
    }));


    it('should add an image if specified', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            {
              id: '1',
              imageUrl: testImage,
              className: 'image-1'
            }
          ];
        },
        getHeaderEntries: function() { return []; }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var img = queryPopup('.image-1 img');

      expect(img).to.exist;
      expect(img.getAttribute('src')).to.eql(testImage);
    }));


    it('should NOT allow XSS via imageUrl', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            {
              id: '1',
              imageUrl: testImage,
              className: 'image-1'
            }
          ];
        },
        getHeaderEntries: function() { return []; }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var injected = queryPopup('marquee');
      expect(injected).not.to.exist;
    }));


    it('should add description if specified', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            {
              id: '1',
              description: 'This is a description'
            }
          ];
        },
        getHeaderEntries: function() { return []; }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var description = queryPopup('.djs-popup-entry-description');

      expect(description).to.exist;
      expect(description.textContent).to.eql('This is a description');
    }));


    it('should add docRef if specified', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getEntries: function() {
          return [
            {
              id: '1',
              documentationRef: '#',
              label: 'with documentation ref'
            }
          ];
        }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var link = queryPopup('.djs-popup-entry-docs a');

      expect(link).to.exist;

      // but when
      link.click();

      // then
      // menu shall remain open
      expect(popupMenu.isOpen()).to.be.true;
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

        var container = getPopupContainer(popupMenu);

        // then
        expect(queryPopup('.popup-menu1')).to.be.null;
        expect(queryPopup('.popup-menu2')).not.to.be.null;

        var popupBackdropEl = container.childNodes[0];

        var popupEl = popupBackdropEl.childNodes[0];
        expect(popupEl.style.left).to.eql('200px');
        expect(popupEl.style.top).to.eql('200px');
        expect(domClasses(popupEl).has('popup-menu2')).to.be.true;

        var group = getGroup('default');

        expect(group.childNodes[0].textContent).to.eql('Entry A');
        expect(group.childNodes[1].textContent).to.eql('Entry B');
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


    it('should be attached to the top of the popup menu, if set', inject(
      function(popupMenu) {

        // when
        popupMenu.registerProvider('menu', menuProvider);
        popupMenu.open({}, 'menu', { x: 100, y: 100 });

        // then
        var popupHeader = queryPopup('.djs-popup .header');
        expect(domQuery('.djs-popup-header .entry', popupHeader)).to.exist;
      }
    ));


    it('should add custom class to header entry if specified', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getHeaderEntries: function() {
          return [ { id: '1', className: 'header-entry-1' } ];
        },
        getEntries: function() {
          return [ { id: '2', label: 'foo' } ];
        }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var element = queryPopup('.header-entry-1');
      expect(element.className).to.eql('entry header-entry-1');
    }));


    it('should add an image to the header section, if specified', inject(function(popupMenu) {

      // given
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

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var img = queryPopup('.image-1 img');

      expect(img).to.exist;
      expect(img.getAttribute('src')).to.eql(testImage);
    }));


    it('should NOT allow XSS via imageUrl', inject(function(popupMenu) {

      // given
      var testMenuProvider = {
        getHeaderEntries: function() {
          return [
            {
              id: '1',
              imageUrl: '"><marquee />'
            }
          ];
        },
        getEntries: function() { return []; }
      };

      // when
      popupMenu.registerProvider('test-menu', testMenuProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      // then
      var injected = queryPopup('marquee');
      expect(injected).not.to.exist;
    }));


    it('should add a labeled element to the header section, if specified', inject(
      function(popupMenu) {

        // given
        var testMenuProvider = {
          getHeaderEntries: function() {
            return [ { id: '1', label: 'foo', className: 'label-1' } ];
          },
          getEntries: function() { return []; }
        };

        // when
        popupMenu.registerProvider('test-menu', testMenuProvider);
        popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

        // then
        var element = queryPopup('.label-1');
        expect(element.textContent).to.eql('foo');
      }
    ));


    it('should throw an error if the position argument is missing', inject(
      function(popupMenu) {

        // given
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
      expect(queryPopup('.djs-popup-header')).not.to.exist;
      expect(queryPopup('.djs-popup-body')).not.to.exist;
    }));


    it('should trigger action on click', inject(function(popupMenu) {

      // given
      var actionListener = sinon.spy();

      var testProvider = {
        getHeaderEntries: function() {
          return [ {
            id: '1',
            action: actionListener,
            label: 'foo'
          } ];
        },
        getEntries: function() { return []; }
      };

      // when
      popupMenu.registerProvider('test-menu', testProvider);
      popupMenu.open({}, 'test-menu', { x: 100, y: 100 });

      var entry = queryPopup('.djs-popup-header .entry');

      // when
      entry.click();

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
      entry = queryPopup('.djs-popup-header .entry[data-id="foo"]');

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


    it('should open within bounds above', inject(function(popupMenu) {

      // given
      var documentBounds = document.documentElement.getBoundingClientRect();

      var y = documentBounds.height - 40;

      var cursorPosition = { x: documentBounds.left + 100, y: documentBounds.top + y };

      // when
      popupMenu.open({}, 'custom-provider', cursorPosition);

      var menu = domQuery('.djs-popup', popupMenu._current.container);

      var menuDimensions = {
        width: menu.scrollWidth,
        height: menu.scrollHeight
      };

      // then
      expect(menu.offsetTop).to.be.closeTo(y - menuDimensions.height, 1);
    }));


    it('should open within bounds above (limited client rect height)', inject(

      function(popupMenu) {

        // given
        // limited client rect height
        document.body.style.height = '200px';

        var documentBounds = document.documentElement.getBoundingClientRect();

        var cursorPosition = { x: documentBounds.left + 10, y: documentBounds.top + 150 };

        // when
        popupMenu.open({}, 'custom-provider', { x: 100, y: 150, cursor: cursorPosition });

        var menu = domQuery('.djs-popup', popupMenu._current.container);

        // then
        expect(menu.offsetTop).to.equal(10);
      }
    ));


    it('should open within bounds to the left', inject(function(popupMenu) {

      // given
      var documentBounds = document.documentElement.getBoundingClientRect();

      var cursorPosition = { x: documentBounds.right, y: documentBounds.top + 100 };

      // when
      popupMenu.open({}, 'custom-provider', cursorPosition);

      var menu = domQuery('.djs-popup', popupMenu._current.container);

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

          var menu = domQuery('.djs-popup', popupMenu._current.container);

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

      var entry = queryPopup('[data-id="1"]');

      // when
      var trigger = popupMenu.trigger(globalEvent(entry, { x: 0, y: 0 }));

      // then
      expect(trigger).to.eql('Entry 1');
    }));


    it('should throw an error, if the id of a header entry is not set', inject(
      function(popupMenu) {

        // when
        popupMenu.registerProvider(
          'test-menu',
          new LegacyProvider([ { label: 'foo' } ])
        );

        // then
        expect(function() {
          popupMenu.open({}, 'test-menu', { x: 100, y: 100 });
        }).to.throw('every entry must have the id property set');
      }
    ));


    it('should throw an error, if the id of an entry is not set', inject(
      function(popupMenu) {

        // when
        popupMenu.registerProvider(
          'test-menu',
          new LegacyProvider(null, [ { label: 'foo' } ])
        );

        // then
        expect(function() {
          popupMenu.open({}, 'test-menu', { x: 100, y: 100 });
        }).to.throw('every entry must have the id property set');
      }
    ));

  });

});



// helpers /////////////

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

function queryEntry(id) {
  return queryPopup('[data-id="' + id + '"]');
}

function queryPopup(selector, q = domQuery) {
  var container = getPopupContainer();

  if (selector) {
    expect(container).to.exist;

    return q(selector, container);
  }

  return container;
}

function queryPopupAll(selector) {
  return queryPopup(selector, domQueryAll);
}

function getPopupContainer() {
  return getDiagramJS().invoke(function(popupMenu) {
    return popupMenu._current.container;
  });
}

function getGroup(groupName) {
  return domQuery('[data-group="' + groupName + '"]', getPopupContainer());
}