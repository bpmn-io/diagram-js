import { isArray } from 'min-dash';

/**
 * @typedef { {
 *   index: number;
 *   value: string,
 *   match?: boolean;
 *   start?: boolean;
 *   end?: boolean;
 *   wordStart?: boolean;
 *   wordEnd?: boolean;
 *   all?: boolean;
 * } } BaseToken
 *
 * @typedef { BaseToken | BaseToken[] } Token
 */

/**
 * @template R
 *
 * @typedef { {
 *   item: R,
 *   tokens: Record<string, Token[]>
 * } } SearchResult
 */

/**
 * @typedef {Record<string, string | string[]>} SearchItem
 */

/**
 * Search items by query.
 *
 * @template { SearchItem } T
 *
 * @param { T[] } items elements to search in
 * @param { string } pattern pattern to search for
 * @param { {
 *   keys: string[];
 * } } options
 *
 * @returns { SearchResult<T>[] }
 */
export default function search(items, pattern, options) {

  const {
    keys
  } = options;

  pattern = pattern.trim().toLowerCase();

  if (!pattern) {
    throw new Error('<pattern> must not be empty');
  }

  const words = pattern.trim().toLowerCase().split(/\s+/);

  return items.flatMap((/** @type {T} */ item) => {
    const tokens = matchItem(item, words, keys);

    if (!tokens) {
      return [];
    }

    return {
      item,
      tokens
    };
  }).sort(createResultSorter(keys));
}

/**
 * Match an item and return tokens in case of a match.
 *
 * @param { SearchItem } item element to be matched
 * @param { string[] } words words from search pattern to find
 * @param { string[] } keys keys to search in the item
 *
 * @returns { Record<string, Token[]> | null }
 */
function matchItem(item, words, keys) {

  const {
    matchedWords,
    tokens
  } = keys.reduce((result, key) => {
    const itemValue = item[ key ];

    const {
      tokens,
      matchedWords
    } = isArray(itemValue) ? (
      itemValue.reduce(
        (result, itemString) => {
          const { tokens, matchedWords } = matchString(itemString, words);

          return {
            tokens: [ ...result.tokens, tokens ],
            matchedWords: {
              ...result.matchedWords,
              ...matchedWords
            }
          };
        },
        {
          matchedWords: /** @type { Record<string, boolean> } */ ({}),
          tokens: /** @type { Token[] } */ ([])
        }
      )
    ) : (
      matchString(itemValue, words)
    );

    return {
      tokens: {
        ...result.tokens,
        [ key ]: tokens,
      },
      matchedWords: {
        ...result.matchedWords,
        ...matchedWords
      }
    };
  }, {
    matchedWords: {},
    tokens: {}
  });

  // only return result if every word got matched
  if (Object.keys(matchedWords).length !== words.length) {
    return null;
  }

  return tokens;
}

/**
 * Creates a compare function that can be used in Array.sort() based on a custom scoring function
 *
 * @template {SearchItem} T
 *
 * @param { string[] } keys
 *
 * @returns { (resultA: SearchResult<T>, resultB: SearchResult<T>) => number }
 */
function createResultSorter(keys) {

  /**
   * @param { SearchResult<T> } resultA
   * @param { SearchResult<T> } resultB
   */
  return (resultA, resultB) => {
    let comparison = 0;

    // used to assign some priority to earlier keys
    let modifier = 1;

    for (const key of keys) {

      const tokenComparison = compareTokens(
        resultA.tokens[key],
        resultB.tokens[key]
      );

      if (tokenComparison !== 0) {
        comparison += tokenComparison * modifier;
        modifier *= DECAY_MODIFIER;
        continue;
      }

      const stringComparison = compareStrings(
        resultA.item[ key ],
        resultB.item[ key ]
      );

      if (stringComparison !== 0) {
        comparison += stringComparison * modifier;
        modifier *= DECAY_MODIFIER;
        continue;
      }
    }

    return comparison;
  };

}

/**
 * Compares two token arrays.
 *
 * @param { Token[] } tokensA
 * @param { Token[] } tokensB
 *
 * @returns { number }
 */
function compareTokens(tokensA, tokensB) {
  return scoreTokens(tokensB) - scoreTokens(tokensA);
}

const DECAY_MODIFIER = 0.5;

const TOKEN_MATCH_SCORES = {
  FULL: 131.9,
  START_FULL_WORD: 8.0,
  START_WORD_PART: 7.87,
  WORD_START: 2.19,
  WORD_PART: 1,
  NO_MATCH: -0.07
};

/**
 * @param { Token[] } tokens
 * @returns { number }
 */
function scoreTokens(tokens) {
  const baseScore = tokens.reduce((sum, token) => sum + scoreToken(token), 0);

  const flatTokens = tokens.flat();

  const totalLength = flatTokens.reduce((sum, token) => sum + token.value.length, 0);
  const matchedLength = flatTokens.reduce((sum, token) => sum + (token.match ? token.value.length : 0), 0);

  const density = totalLength ? matchedLength / totalLength : 0;

  const score = baseScore * (1 + density);

  return score;
}

/**
 * Score a token based on its characteristics
 * and the length of the matched content.
 *
 * @param { Token } token
 *
 * @returns { number }
 */
function scoreToken(token) {
  if (isArray(token)) {
    return Math.max(...token.map(scoreToken));
  }

  const modifier = Math.log(token.value.length);

  if (!token.match) {
    return TOKEN_MATCH_SCORES.NO_MATCH * modifier;
  }

  return (
    token.start
      ? (
        token.end
          ? TOKEN_MATCH_SCORES.FULL
          : token.wordEnd
            ? TOKEN_MATCH_SCORES.START_FULL_WORD
            : TOKEN_MATCH_SCORES.START_WORD_PART
      )
      : (
        token.wordStart
          ? TOKEN_MATCH_SCORES.WORD_START
          : TOKEN_MATCH_SCORES.WORD_PART
      )
  ) * modifier;
}

/**
 * @param { string|string[] } [str='']
 *
 * @return { string }
 */
function stringJoin(str = '') {
  return isArray(str) ? str.join(', ') : str;
}

/**
 * Compares two strings. also supports string arrays, which will be joined
 *
 * @param { string|string[] } [a]
 * @param { string|string[] } [b]
 *
 * @returns { number }
 */
function compareStrings(a, b) {
  return stringJoin(a).localeCompare(stringJoin(b));
}

/**
 * Match a given string against a set of words,
 * and return the result.
 *
 * @param { string } string
 * @param { string[] } words
 *
 * @return { {
 *   tokens: BaseToken[],
 *   matchedWords: Record<string, boolean>
 * } }
 */
function matchString(string, words) {

  if (!string) {
    return {
      tokens: [],
      matchedWords: {}
    };
  }

  /**
   * @type { BaseToken[] }
   */
  const tokens = [];

  /**
   * @type { Record<string, boolean> }
   */
  const matchedWords = {};

  const wordsEscaped = words.map(escapeRegexp);

  const regexpString = [
    `(?<all>${wordsEscaped.join('\\s+')})`,
    ...wordsEscaped
  ].join('|');

  const regexp = new RegExp(regexpString, 'ig');

  let match;
  let lastIndex = 0;

  while ((match = regexp.exec(string))) {

    const [ value ] = match;

    const startIndex = match.index;
    const endIndex = match.index + value.length;

    const start = startIndex === 0;
    const end = endIndex === string.length;

    const all = !!match.groups?.all;

    const wordStart = start || /\s/.test(string.charAt(startIndex - 1));
    const wordEnd = end || /\s/.test(string.charAt(endIndex));

    if (match.index > lastIndex) {

      // add previous token (NO match)
      tokens.push({
        value: string.slice(lastIndex, match.index),
        index: lastIndex
      });
    }

    // add current token (match)
    tokens.push({
      value,
      index: match.index,
      match: true,
      wordStart,
      wordEnd,
      start,
      end,
      all
    });

    const newMatchedWords = all ? words : [ value ];

    for (const word of newMatchedWords) {
      matchedWords[word.toLowerCase()] = true;
    }

    lastIndex = match.index + value.length;
  }

  // add after token (NO match)
  if (lastIndex < string.length) {
    tokens.push({
      value: string.slice(lastIndex),
      index: lastIndex
    });
  }

  return {
    tokens,
    matchedWords
  };
}

/**
 * Escape string to not contain illegal regexp chars.
 *
 * @param { string } string
 *
 * @return { string }
 */
function escapeRegexp(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
