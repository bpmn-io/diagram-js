import { isArray } from 'min-dash';

/**
 * @typedef { {
 *   index: number;
 *   match: boolean;
 *   value: string;
 * } } Token
 *
 * @typedef {Token[]} Tokens
 */

/**
 * @template R
 *
 * @typedef { {
 *   item: R,
 *   tokens: Record<string, Tokens>
 * } } SearchResult
 */

/**
 * @typedef {Record<string, string | string[]>} SearchItem
 */

/**
 * Search items by query.
 *
 * @template {SearchItem} T
 *
 * @param {T[]} items elements to search in
 * @param {string} pattern pattern to search for
 * @param { {
 *   keys: string[];
 * } } options
 *
 * @returns {SearchResult<T>[]}
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

  return items.flatMap((item) => {
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
 * @param {SearchItem} item element to be matched
 * @param {string[]} words words from search pattern to find
 * @param {string[]} keys keys to search in the item
 *
 * @returns {Record<string, Tokens>}
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
          matchedWords: {},
          tokens: []
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
 * @param {string[]} keys
 *
 * @returns { (resultA: SearchResult, resultB: SearchResult) => number}
 */
function createResultSorter(keys) {

  /**
   * @param {SearchResult} resultA
   * @param {SearchResult} resultB
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
        modifier *= 0.9;
        continue;
      }

      const stringComparison = compareStrings(
        resultA.item[ key ],
        resultB.item[ key ]
      );

      if (stringComparison !== 0) {
        comparison += stringComparison * modifier;
        modifier *= 0.9;
        continue;
      }
    }

    return comparison;
  };

}

/**
 * Compares two token arrays.
 *
 * @param {Token[]} [tokensA]
 * @param {Token[]} [tokensB]
 *
 * @returns {number}
 */
function compareTokens(tokensA, tokensB) {
  return scoreTokens(tokensB) - scoreTokens(tokensA);
}

/**
 * @param { Token[] } tokens
 * @returns { number }
 */
function scoreTokens(tokens) {
  return tokens.reduce((sum, token) => sum + scoreToken(token), 0);
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
    return -0.07 * modifier;
  }

  return (
    token.start
      ? (
        token.end
          ? 131.9
          : 7.87
      )
      : (
        token.wordStart
          ? 2.19
          : 1
      )
  ) * modifier;
}

/**
 * @param {string|string[]} [str='']
 *
 * @return {string}
 */
function stringJoin(str = '') {
  return isArray(str) ? str.join(', ') : str;
}

/**
 * Compares two strings. also supports string arrays, which will be joined
 *
 * @param {string|string[]} [a]
 * @param {string|string[]} [b]
 *
 * @returns {number}
 */
function compareStrings(a, b) {
  return stringJoin(a).localeCompare(stringJoin(b));
}

/**
 * Match a given string against a set of words,
 * and return the result.
 *
 * @param {string} string
 * @param {string[]} words
 *
 * @return { {
 *   tokens: Token[],
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

  const tokens = [];
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

    const all = !!match.groups.all;

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

function escapeRegexp(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
