/* global sinon */

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

var spy = sinon.spy;


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
      var createSpy = spy(function(event) {
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
          }]
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

      // when
      palette.registerProvider(provider);

      // then
      expect(palette._providers).to.eql([ provider ]);
    }));


    it('should query provider for entries', inject(function(palette) {

      // given
      var provider = new Provider();

      palette.registerProvider(provider);

      var getSpy = spy(provider, 'getPaletteEntries');

      // when
      var entries = palette.getEntries();

      // then
      expect(entries).to.eql({});

      // pass over providers
      expect(getSpy).to.have.been.called;
    }));


    it('should add palette entries', inject(function(canvas, palette) {

      // given
      var entries = {
        'entryA': {
          alt: 'A',
          className: 'FOO',
          action: function() {
            console.log('click entryA', arguments);
          }
        },
        'entryB': {
          alt: 'B',
          imageUrl: 'http://placehold.it/40x40',
          action: {
            click: function() {
              console.log('click entryB');
            },
            dragstart: function(event) {
              console.log('dragstart entryB');
              event.preventDefault();
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


      it('should recognize Array<String> as className', testClassName({
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

      // marker class on .djs-container
      expectPaletteCls('open', true);
    }));


    it('should close', inject(function(eventBus, palette) {

      // given
      var changedSpy = spy(function(event) {
        expect(event.open).to.be.false;
        expect(event.twoColumn).to.be.false;
      });

      eventBus.on('palette.changed', changedSpy);

      // when
      palette.close();

      // then
      expect(palette.isOpen()).to.be.false;

      // no marker class on .djs-container
      expectPaletteCls('open', false);

      expect(changedSpy).to.have.been.called;
    }));


    it('should re-open', inject(function(eventBus, palette) {

      // given
      palette.close();

      var changedSpy = spy(function(event) {
        expect(event.open).to.be.true;
        expect(event.twoColumn).to.be.false;
      });

      eventBus.on('palette.changed', changedSpy);

      // when
      palette.open();

      // then
      expect(palette.isOpen()).to.be.true;

      // no marker class on .djs-container
      expectPaletteCls('open', true);

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

        var changedSpy = spy(function(event) {
          expect(event.open).to.be.true;
          expect(event.twoColumn).to.be.false;
        });

        eventBus.on('palette.changed', changedSpy);

        // when
        canvas.resized();

        // then
        expectPaletteCls('two-column', false);

        expect(changedSpy).to.have.been.called;
      })
    );


    it('should collapse into two columns',
      inject(function(eventBus, canvas, palette) {
        // given
        var parent = canvas.getContainer();

        parent.style.height = '270px';

        var changedSpy = spy(function(event) {
          expect(event.open).to.be.true;
          expect(event.twoColumn).to.be.true;
        });

        eventBus.on('palette.changed', changedSpy);

        // when
        canvas.resized();

        // then
        expectPaletteCls('two-column', true);

        expect(changedSpy).to.have.been.called;
      })
    );


    it('should turn the palette into a one column layout',
      inject(function(canvas, eventBus, palette) {
        var parent = canvas.getContainer();

        parent.style.height = '270px';
        canvas.resized();

        var changedSpy = spy(function(event) {
          expect(event.open).to.be.true;
          expect(event.twoColumn).to.be.false;
        });

        eventBus.on('palette.changed', changedSpy);

        // when
        parent.style.height = '300px';
        canvas.resized();

        // then
        expectPaletteCls('two-column', false);

        expect(changedSpy).to.have.been.called;
      })
    );

  });

});



// helpers //////////////////////

function Provider(entries) {
  this.getPaletteEntries = function() {
    return entries || {};
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