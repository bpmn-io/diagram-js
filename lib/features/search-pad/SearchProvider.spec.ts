import SearchProvider, { SearchResult } from './SearchPadProvider';

import { create } from '../../model';

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
          },
          {
            match: true,
            value: 'bar'
          }
        ],
        secondaryTokens: [
          {
            matched: 'bar',
            normal: 'bar'
          },
          {
            match: false,
            value: 'foo'
          }
        ],
        element: create('shape')
      }
    ];
  }
}