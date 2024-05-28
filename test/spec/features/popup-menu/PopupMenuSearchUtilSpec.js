import { searchEntries } from '../../../../lib/features/popup-menu/PopupMenuSearchUtil';


describe('features/popup-menu - PopupMenuSearchUtil', function() {

  describe('ranking', function() {

    it('should hide rank < 0 if not searching', function() {

      // given
      const entries = [
        { id: 'entry-1', rank: -1 },
        { id: 'entry-2' },
        { id: 'entry-3' }
      ];

      // when
      const result = searchEntries(entries, '');

      // then
      expect(result).to.have.length(2);
      expect(result[0]).to.equal(entries[1]);
      expect(result[1]).to.equal(entries[2]);
    });

  });


  describe('searching', function() {

    const entries = [
      { id: 1, label: 'Apple' },
      { id: 2, label: 'Banana' },
      { id: 3, label: 'Cherry' },
      { id: 4, label: 'Orange' },
      { id: 5, label: 'Clementine', search: 'Mandarine Tangerine' },
      { id: 6, label: 'Pineapple', description: 'Tropical fruit' },
      { id: 7, label: 'Watermelon' }
    ];

    expectEntries('should find entries by <label> (substring)', entries, [
      'Banana'
    ], 'ban');

    expectEntries('should find entries by <label>', entries, [
      'Banana'
    ], 'banana');

    expectEntries('should find entries by <label> (superstring)', entries, [
      'Banana'
    ], 'bananas');

    expectEntries('should find entries by <label> (below threshold)', entries, [
      'Banana'
    ], 'ananas');

    expectEntries('should not find entries by <label> (above threshold)', entries, [], 'panama');

    expectEntries('should find entries by <label> (rank by location)', entries, [
      'Apple',
      'Pineapple'
    ], 'apple');

    expectEntries('shoud find entries by <description>', entries, [
      'Pineapple'
    ], 'tropical');

    expectEntries('should find entries by <search>', entries, [
      'Clementine'
    ], 'mandarine');

  });

});

function expectEntries(title, entries, expected, search) {
  it(title, function() {

    // when
    const result = searchEntries(entries, search);

    // then
    expect(result).to.have.length(expected.length);

    expected.forEach((label, index) => {
      expect(result[ index ].label).to.equal(label);
    });
  });
}