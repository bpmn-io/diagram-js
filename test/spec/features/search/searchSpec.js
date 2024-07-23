import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import search from '../../../../lib/features/search';

describe('search', function() {

  beforeEach(bootstrapDiagram({ modules: [ search ] }));


  it('should expose search', inject(function(search) {
    expect(search).to.exist;
  }));


  it('complex', inject(function(search) {

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


  it('should by match', inject(function(search) {

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


  it('should by match location', inject(function(search) {

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
    expect(results[1].item).to.eql(items[2]);
    expect(results[2].item).to.eql(items[0]);
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

});


describe('overriding search', function() {

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