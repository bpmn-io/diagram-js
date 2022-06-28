import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import paletteModule from 'lib/features/palette';

import {
  query as domQuery,
  classes as domClasses
} from 'min-dom';

import {
  assign
} from 'min-dash';


describe('features/palette', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        paletteModule
      ]
    }));


    it('should not attach without provider', inject(function(canvas, palette) {

      // given
      var paletteEl = domQuery('.djs-palette', canvas.getContainer());

      // then
      expect(paletteEl).not.to.exist;
    }));


    it('should create + attach with provider', inject(function(eventBus, canvas, palette) {

      // given
      var createSpy = sinon.spy(function(event) {
        expect(event.container).to.equal(palette._container);
      });

      eventBus.on('palette.create', createSpy);

      // when
      palette.registerProvider(new Provider());

      // then
      var paletteEl = domQuery('.djs-palette', canvas.getContainer());

      expect(paletteEl).to.exist;

      expect(createSpy).to.have.been.called;
    }));

  });


  describe('create on bootstrap', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        paletteModule,
        {
          __init__: [
            'paletteProvider',
            'paletteCreateListener'
          ],
          paletteCreateListener: [ 'type', function(eventBus) {

            var self = this;

            eventBus.on('palette.create', function() {
              self.createCalled = true;
            });
          } ],
          paletteProvider: [ 'type', function(palette) {
            palette.registerProvider(new Provider());
          } ]
        }
      ]
    }));


    it('should emit palette.create', inject(function(paletteCreateListener) {

      expect(paletteCreateListener.createCalled).to.be.true;
    }));

  });


  describe('providers', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        paletteModule
      ]
    }));


    it('should register provider', inject(function(palette) {

      // given
      var provider = new Provider();

      // then
      expect(function() {
        palette.registerProvider(provider);
      }).not.to.throw();
    }));


    it('should query provider for entries', inject(function(palette) {

      // given
      var provider = new Provider();

      palette.registerProvider(provider);

      var getSpy = sinon.spy(provider, 'getPaletteEntries');

      // when
      var entries = palette.getEntries();

      // then
      expect(entries).to.eql({});

      // pass over providers
      expect(getSpy).to.have.been.called;
    }));


    it('should add palette entries', inject(function(canvas, palette) {

      var img =
        '<svg width="46" height="46" viewBox="-2 -2 9.82 9.82" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="m1.86 5.12-.72-.53 1.17-1.5c-.61-.16-1.22-.32-1.83-.5l.28-.85 1.78.65L2.46.5h.9l-.08 1.9 1.78-.66.28.86-1.83.5 1.17 1.49-.72.53-1.05-1.58-1.05 1.58Z" />' +
        '</svg>';

      var imgUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(img);

      // given
      var entries = {
        'entryA': {
          alt: 'A',
          className: 'FOO',
          action: function() {
            console.log('click entryA', arguments);
          }
        },
        'entryA2': {
          alt: 'A2',
          className: 'FOO',
          action: function() {
            console.log('click entryA2', arguments);
          }
        },
        'separator1': {
          separator: true
        },
        'entryB': {
          alt: 'B',
          imageUrl: imgUrl,
          action: {
            click: function() {
              console.log('click entryB');
            },
            dragstart: function(event) {
              console.log('dragstart entryB');
              event.preventDefault();
            }
          }
        },
        'separator2': {
          separator: true
        },
        'entryB2': {
          alt: 'B',
          imageUrl: imgUrl,
          action: {
            click: function() {
              console.log('click entryB2');
            },
            dragstart: function(event) {
              console.log('dragstart entryB2');
              event.preventDefault();
            }
          }
        },
        'entryC': {
          alt: 'C',
          imageUrl: imgUrl,
          action: {
            click: function() {
              console.log('click entryB');
            }
          }
        }
      };

      var provider = new Provider(entries);

      // when
      palette.registerProvider(provider);
      palette.open();

      // then data structure should set
      var pEntries = palette.getEntries();
      expect(pEntries.entryA).to.exist;
      expect(pEntries.entryB).to.exist;

      // then DOM should contain entries
      var entryA = domQuery('[data-action="entryA"]', palette._container);
      expect(entryA).to.exist;
      expect(domClasses(entryA).has('FOO')).to.be.true;

      var entryB = domQuery('[data-action="entryB"]', palette._container);
      expect(entryB).to.exist;
      expect(domQuery('img', entryB)).to.exist;
    }));


    describe('with updater', function() {

      it('should allow to add entries', inject(function(palette) {

        // given
        function updater(entries) {
          return assign(entries, { entryB: {} });
        }

        var plainProvider = new Provider({ entryA: { action: function() {} } }),
            updatingProvider = new Provider(updater);

        palette.registerProvider(plainProvider);
        palette.registerProvider(updatingProvider);

        // when
        var entries = palette.getEntries();

        // then
        expect(entries.entryA).to.exist;
        expect(entries.entryB).to.exist;
      }));


      it('should allow to update entries', inject(function(palette) {

        // given
        function updater(entries) {
          return assign(entries, { entryA: { alt: 'text' } });
        }

        var plainProvider = new Provider({ entryA: { action: function() {} } }),
            updatingProvider = new Provider(updater);

        palette.registerProvider(plainProvider);
        palette.registerProvider(updatingProvider);

        // when
        var entries = palette.getEntries();

        // then
        expect(entries.entryA).to.exist;
        expect(entries.entryA).to.have.property('alt');
      }));


      it('should allow to remove entries', inject(function(palette) {

        // given
        function updater(entries) {
          return {};
        }

        var plainProvider = new Provider({ entryA: { action: function() {} } }),
            updatingProvider = new Provider(updater);

        palette.registerProvider(plainProvider);
        palette.registerProvider(updatingProvider);

        // when
        var entries = palette.getEntries();

        // then
        expect(entries.entryA).to.not.exist;
      }));
    });


    describe('ordering', function() {

      function updater(entries) {
        return {};
      }

      var plainProvider = new Provider({ entryA: { action: function() {} } }),
          updatingProvider = new Provider(updater);


      it('should call providers by registration order per default', inject(function(palette) {

        // given
        palette.registerProvider(plainProvider);
        palette.registerProvider(updatingProvider);

        // when
        var entries = palette.getEntries();

        // then
        expect(entries.entryA).to.not.exist;
      }));


      it('should call providers by priority', inject(function(palette) {

        // given
        palette.registerProvider(plainProvider);
        palette.registerProvider(1200, updatingProvider);

        // when
        var entries = palette.getEntries();

        // then
        expect(entries.entryA).to.exist;
      }));

    });


    describe('entry className', function() {

      function testClassName(options) {

        var set = options.set,
            expected = options.expect;

        return inject(function(palette) {

          // given
          var entries = {
            'entryA': {
              alt: 'A',
              className: set
            }
          };

          var provider = new Provider(entries);

          // when
          palette.registerProvider(provider);
          palette.open();

          // then DOM should contain entries
          var entryA = domQuery('[data-action="entryA"]', palette._container);
          expect(entryA).to.exist;

          // expect all classes to be set
          expected.forEach(function(cls) {
            expect(domClasses(entryA).has(cls)).to.be.true;
          });
        });
      }


      it('should recognize Array<string> as className', testClassName({
        set: [ 'FOO', 'BAAAR' ],
        expect: [ 'FOO', 'BAAAR' ]
      }));


      it('should recognize <space separated classes> as className', testClassName({
        set: 'FOO BAAAR blub',
        expect: [ 'FOO', 'BAAAR', 'blub' ]
      }));

    });

  });


  describe('lifecycle', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        paletteModule
      ]
    }));

    beforeEach(inject(function(palette) {
      palette.registerProvider(new Provider());
    }));


    it('should be opened (default)', inject(function(palette) {

      // then
      expect(palette.isOpen()).to.be.true;

      // marker class on .djs-palette
      expectPaletteCls('open', true);

      // marker class on .djs-container
      expectContainerCls('djs-palette-open', true);
      expectContainerCls('djs-palette-shown', true);
    }));


    it('should close', inject(function(eventBus, palette) {

      // given
      var changedSpy = sinon.spy(function(event) {
        expect(event.open).to.be.false;
        expect(event.twoColumn).to.be.false;
      });

      eventBus.on('palette.changed', changedSpy);

      // when
      palette.close();

      // then
      expect(palette.isOpen()).to.be.false;

      // no marker class on .djs-palette
      expectPaletteCls('open', false);

      // no marker class on .djs-container
      expectContainerCls('djs-palette-open', false);
      expectContainerCls('djs-palette-shown', true);


      expect(changedSpy).to.have.been.called;
    }));


    it('should re-open', inject(function(eventBus, palette) {

      // given
      palette.close();

      var changedSpy = sinon.spy(function(event) {
        expect(event.open).to.be.true;
        expect(event.twoColumn).to.be.false;
      });

      eventBus.on('palette.changed', changedSpy);

      // when
      palette.open();

      // then
      expect(palette.isOpen()).to.be.true;

      // marker class on .djs-palette
      expectPaletteCls('open', true);

      // marker class on .djs-container
      expectContainerCls('djs-palette-open', true);
      expectContainerCls('djs-palette-shown', true);

      expect(changedSpy).to.have.been.called;
    }));

  });


  describe('column layout', function() {

    var entries = {
      'entryA': {
        action: function() {}
      },
      'entryB': {
        action: function() {}
      },
      'entryC': {
        action: function() {}
      },
      'entryD': {
        action: function() {}
      },
      'entryE': {
        action: function() {}
      }
    };

    beforeEach(bootstrapDiagram({
      modules: [ paletteModule ]
    }));

    beforeEach(inject(function(palette) {

      palette.registerProvider(new Provider(entries));
    }));


    it('should be single column if enough space for entries',
      inject(function(eventBus, canvas, palette) {

        // given
        var parent = canvas.getContainer();

        parent.style.height = '300px';

        var changedSpy = sinon.spy(function(event) {
          expect(event.open).to.be.true;
          expect(event.twoColumn).to.be.false;
        });

        eventBus.on('palette.changed', changedSpy);

        // when
        canvas.resized();

        // then
        expectPaletteCls('two-column', false);
        expectContainerCls('djs-palette-two-column', false);

        expect(changedSpy).to.have.been.called;
      })
    );


    it('should collapse into two columns',
      inject(function(eventBus, canvas, palette) {

        // given
        var parent = canvas.getContainer();

        parent.style.height = '270px';

        var changedSpy = sinon.spy(function(event) {
          expect(event.open).to.be.true;
          expect(event.twoColumn).to.be.true;
        });

        eventBus.on('palette.changed', changedSpy);

        // when
        canvas.resized();

        // then
        expectPaletteCls('two-column', true);
        expectContainerCls('djs-palette-two-column', true);

        expect(changedSpy).to.have.been.called;
      })
    );


    it('should turn the palette into a one column layout',
      inject(function(canvas, eventBus, palette) {
        var parent = canvas.getContainer();

        parent.style.height = '270px';
        canvas.resized();

        var changedSpy = sinon.spy(function(event) {
          expect(event.open).to.be.true;
          expect(event.twoColumn).to.be.false;
        });

        eventBus.on('palette.changed', changedSpy);

        // when
        parent.style.height = '300px';
        canvas.resized();

        // then
        expectPaletteCls('two-column', false);
        expectContainerCls('djs-palette-two-column', false);

        expect(changedSpy).to.have.been.called;
      })
    );

  });


  describe('tools highlighting', function() {

    var entries = {
      'entryA': {
        group: 'tools',
        action: function() {}
      },
      'entryB': {
        group: 'tools',
        action: function() {}
      },
      'entryC': {
        action: function() {}
      }
    };

    beforeEach(bootstrapDiagram({
      modules: [ paletteModule ]
    }));

    beforeEach(inject(function(palette) {

      palette.registerProvider(new Provider(entries));
    }));


    (isPhantomJS() ? it.skip : it)('should update tool highlight', inject(function(eventBus, palette) {

      // given
      var toolName = 'entryA';

      // when
      eventBus.fire('tool-manager.update', { tool: toolName });

      var entryNode = getEntryNode(toolName, palette._container);

      // then
      expect(is(entryNode, 'highlighted-entry')).to.be.true;

    }));


    (isPhantomJS() ? it.skip : it)('should unset tool highlight', inject(function(eventBus, palette) {

      // given
      var toolName = 'entryA';

      // when
      eventBus.fire('tool-manager.update', { tool: toolName });
      eventBus.fire('tool-manager.update', { tool: 'other' });

      var entryNode = getEntryNode(toolName, palette._container);

      // then
      expect(is(entryNode, 'highlighted-entry')).to.be.false;

    }));

  });


  describe('DOM injection', function() {

    beforeEach(bootstrapDiagram({
      modules: [ paletteModule ]
    }));


    it('should NOT allow XSS via group name', inject(function(canvas, palette) {

      // given
      var entries = {
        'entryA': {
          group: '"><marquee />'
        }
      };

      // when
      palette.registerProvider(new Provider(entries));

      // then
      var injected = domQuery('marquee', canvas.getContainer());
      expect(injected).not.to.exist;
    }));


    it('should NOT allow XSS via imageUrl', inject(function(canvas, palette) {

      // given
      var entries = {
        'entryA': {
          imageUrl: '"><marquee />'
        }
      };

      // when
      palette.registerProvider(new Provider(entries));

      // then
      var injected = domQuery('marquee', canvas.getContainer());
      expect(injected).not.to.exist;
    }));

  });

});



// helpers //////////////////////

function Provider(entriesOrUpdater) {
  this.getPaletteEntries = function() {
    return entriesOrUpdater || {};
  };
}

function is(node, cls) {
  return domClasses(node).has(cls);
}


function expectPaletteCls(marker, expectedActive) {
  getDiagramJS().invoke(function(palette) {
    var isActive = is(palette._container, marker);

    expect(isActive).to.eql(expectedActive);
  });
}

function expectContainerCls(marker, expectedActive) {
  getDiagramJS().invoke(function(canvas) {
    var isActive = is(canvas._container, marker);

    expect(isActive).to.eql(expectedActive);
  });
}

function getEntryNode(action, container) {
  return domQuery('.entry[data-action="' + action + '"]', container);
}

function isPhantomJS() {
  return /PhantomJS/.test(window.navigator.userAgent);
}