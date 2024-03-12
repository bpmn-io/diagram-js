import SearchProvider, { SearchResult } from './SearchPadProvider.js';

import { create } from '../../model/index.js';

export class FooSearchProvider implements SearchProvider {
  find(pattern: string): SearchResult[] {
    return [
      {
        primaryTokens: [
          {
            matched: 'foo',
            normal: 'foo'
          },
          {
            matched: pattern,
            normal: pattern
          }
        ],
        secondaryTokens: [
          {
            matched: 'bar',
            normal: 'bar'
          }
        ],
        element: create('shape')
      }
    ];
  }
}