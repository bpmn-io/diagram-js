/**
 * Search items by query.
 *
 *
 * @param items
 * @param pattern
 * @param options
 *
 * @returns
 */
export default function search<T>(
  items: T[],
  pattern: string,
  options: {
      keys: string[];
  }
): SearchResult<T>[];
export type Token = {
    index: number;
    match: boolean;
    value: string;
};
export type Tokens = Token[];
export type SearchResult<R> = {
    item: R;
    tokens: Record<string, Token[]>;
};
