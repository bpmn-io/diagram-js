import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import search from '../../../../lib/features/search';


describe('features/search', function() {

  beforeEach(bootstrapDiagram({ modules: [ search ] }));


  it('should expose search', inject(function(search) {
    expect(search).to.exist;
  }));


  it('should search simple', inject(function(search) {

    // given
    const items = [
      {
        title: 'foo',
        description: 'woop'
      },
      {
        title: 'foobar'
      }
    ];

    const searchItems = (items, term) => search(items, term, {
      keys: [
        'title',
        'description'
      ]
    });

    // then
    expect(searchItems(items, 'foo')).to.have.length(2);
    expect(searchItems(items, 'bar')).to.have.length(1);
    expect(searchItems(items, 'other')).to.have.length(0);
  }));


  describe('result', function() {

    it('should provide <item>', inject(function(search) {

      // given
      const items = [
        {
          title: 'foo',
          description: 'woop'
        },
        {
          title: 'foobar'
        }
      ];

      // when
      const result = search(items, 'foo', {
        keys: [
          'title',
          'description'
        ]
      });

      // then
      expect(result[0].item).to.equal(items[0]);
      expect(result[1].item).to.equal(items[1]);
    }));


    it('should provide <tokens>', inject(function(search) {

      // given
      const items = [
        {
          title: 'foo',
          description: 'woop'
        },
        {
          title: 'foobar'
        }
      ];

      // when
      const result = search(items, 'foo', {
        keys: [
          'title',
          'description'
        ]
      });

      // then
      expect(result[0].tokens).to.have.keys([ 'title', 'description' ]);
      expect(result[1].tokens).to.have.keys([ 'title', 'description' ]);

      expect(result[1].tokens.description).to.be.empty;
    }));

  });


  it('should search complex', inject(function(search) {

    // given
    const items = [
      {
        title: 'bar',
        description: 'foo'
      },
      {
        title: 'foo',
        description: 'bar'
      },
      {
        title: 'baz',
        description: 'baz'
      },
      {
        title: 'baz',
        description: 'bar foobar'
      },
      {
        title: 'baz',
        description: 'bar foo'
      },
      {
        title: 'bar foo',
        description: 'baz'
      }
    ];

    // when
    const results = search(items, 'foo', {
      keys: [
        'title',
        'description'
      ]
    });

    // then
    expect(results).to.have.length(5);
    expect(results[0].item).to.eql(items[1]);
    expect(results[1].item).to.eql(items[5]);
    expect(results[2].item).to.eql(items[0]);
    expect(results[3].item).to.eql(items[4]);
    expect(results[4].item).to.eql(items[3]);
  }));


  it('should sort by match', inject(function(search) {

    // given
    const items = [
      {
        title: 'bar',
        description: 'baz'
      },
      {
        title: 'foo',
        description: 'bar'
      },
      {
        title: 'baz',
        description: 'foo'
      }
    ];

    // when
    const results = search(items, 'foo', {
      keys: [
        'title',
        'description'
      ]
    });

    // then
    expect(results).to.have.length(2);
    expect(results[0].item).to.eql(items[1]);
    expect(results[1].item).to.eql(items[2]);
  }));


  it('should prioritize start of word', inject(function(search) {

    // given
    const items = [
      {
        title: 'bar baz foo',
        description: 'bar'
      },
      {
        title: 'foo',
        description: 'bar'
      },
      {
        title: 'baz foo',
        description: 'bar'
      }
    ];

    // when
    const results = search(items, 'foo', {
      keys: [
        'title',
        'description'
      ]
    });

    // then
    expect(results).to.have.length(3);
    expect(results[0].item).to.eql(items[1]);
    expect(results[1].item).to.eql(items[0]);
    expect(results[2].item).to.eql(items[2]);
  }));


  it('should prioritize start of term', inject(function(search) {

    // given
    const items = [
      {
        title: 'yes barfoo'
      },
      {
        title: 'yes foowoo'
      }
    ];

    // when
    const results = search(items, 'foo', {
      keys: [
        'title'
      ]
    });

    // then
    expect(results).to.have.length(2);
    expect(results[0].item).to.eql(items[1]);
    expect(results[1].item).to.eql(items[0]);
  }));


  it('should sort alphabetically', inject(function(search) {

    // given
    const items = [
      {
        title: 'foobaz',
        description: 'foo'
      },
      {
        title: 'foobar',
        description: 'foo'
      },
      {
        title: 'foobazbaz',
        description: 'foo'
      }
    ];

    // when
    const results = search(items, 'foo', {
      keys: [
        'title',
        'description'
      ]
    });

    // then
    expect(results).to.have.length(3);
    expect(results[0].item).to.eql(items[1]);
    expect(results[1].item).to.eql(items[0]);
    expect(results[2].item).to.eql(items[2]);
  }));


  it('should handle missing keys', inject(function(search) {

    // given
    const items = [
      {
        title: 'bar',
        description: 'foo'
      },
      {
        title: 'bar'
      },
      {
        title: 'foo',
        description: 'bar'
      }
    ];

    // when
    const results = search(items, 'foo', {
      keys: [
        'title',
        'description'
      ]
    });

    // then
    expect(results).to.have.length(2);
    expect(results[0].item).to.eql(items[2]);
    expect(results[1].item).to.eql(items[0]);
  }));


  it('should handle duplicate entries', inject(function(search) {

    // given
    const items = [
      {
        title: 'baz',
        description: 'baz'
      },
      {
        title: 'Kafka message',
        description: 'Nope'
      },
      {
        title: 'Kafka message',
        description: 'Nope'
      }
    ];

    // when
    const results = search(items, 'g', {
      keys: [
        'title',
        'description',
        'search'
      ]
    });

    // then
    expect(results).to.have.length(2);
  }));


  it('should match case insensitive', inject(function(search) {

    // given
    const items = [
      {
        title: 'KAFKAF'
      }
    ];

    // when
    const results = search(items, 'kaf', {
      keys: [
        'title'
      ]
    });

    // then
    expect(results).to.have.length(1);
    expect(results[0].item).to.eql(items[0]);
  }));


  it('should match partial tokens', inject(function(search) {

    // given
    const items = [
      {
        title: 'Kafka amess',
        description: 'Nope'
      },
      {
        title: 'mess',
        description: 'kafka'
      },
      {
        title: 'mess'
      }
    ];

    // when
    const results = search(items, 'Kaf mess', {
      keys: [
        'title',
        'description',
        'search'
      ]
    });

    // then
    expect(results).to.have.length(2);
    expect(results[0].item).to.eql(items[0]);
    expect(results[1].item).to.eql(items[1]);
  }));


  it('should match with spaces', inject(function(search) {

    // given
    const items = [
      {
        title: 'bar foo bar'
      },
      {
        title: 'other bar foo'
      }
    ];

    // when
    const results = search(items, 'foo bar', {
      keys: [
        'title',
        'description',
        'search'
      ]
    });

    // then
    expect(results).to.have.length(2);
    expect(results[0].item).to.eql(items[0]);
    expect(results[1].item).to.eql(items[1]);
  }));


  it('should search with whitespace', inject(function(search) {

    // given
    const items = [
      {
        title: 'bar foo bar'
      }
    ];

    // when
    const results = search(items, ' foo   bar ', {
      keys: [
        'title'
      ]
    });

    // then
    expect(results).to.have.length(1);
  }));

});


describe('features/search - overrides', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      {
        search: [
          'value',
          function(items, pattern, { keys, customOption }) {
            return items
              .filter(item => {
                return keys.some(key => {
                  return item[ key ].indexOf(pattern) !== -1;
                }) && customOption;
              })
              .map(item => {
                return {
                  item,
                  tokens: []
                };
              });
          }
        ]
      }
    ]
  }));


  it('should override search', inject(function(search) {

    // given
    const items = [
      {
        title: 'bar',
        custom: 'foo'
      },
      {
        title: 'bar',
        custom: 'baz'
      },
      {
        title: 'foo',
        custom: 'bar'
      }
    ];

    // when
    const results = search(items, 'foo', {
      keys: [
        'title',
        'custom'
      ],
      customOption: true
    });

    // then
    expect(results).to.have.length(2);
    expect(results[0].item).to.eql(items[0]);
    expect(results[1].item).to.eql(items[2]);
  }));

});