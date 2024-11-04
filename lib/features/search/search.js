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
 * Search items by query.
 *
 * @template T
 *
 * @param {T[]} items
 * @param {string} pattern
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
 * @param {Object} item
 * @param {string[]} words
 * @param {string[]} keys
 *
 * @returns {Record<string, Tokens>}
 */
function matchItem(item, words, keys) {

  const {
    matchedWords,
    tokens
  } = keys.reduce((result, key) => {
    const string = item[ key ];

    const {
      tokens,
      matchedWords
    } = matchString(string, words);

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
 * Get index of result in list of results.
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

    for (const key of keys) {

      const tokenComparison = compareTokens(
        resultA.tokens[key],
        resultB.tokens[key]
      );

      if (tokenComparison !== 0) {
        return tokenComparison;
      }

      const stringComparison = compareStrings(
        resultA.item[ key ],
        resultB.item[ key ]
      );

      if (stringComparison !== 0) {
        return stringComparison;
      }

      // fall back to next key
      continue;
    }

    // eventually call equality
    return 0;
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
 * Score a token.
 *
 * @param { Token } token
 *
 * @returns { number }
 */
function scoreToken(token) {
  if (!token.match) {
    return 0;
  }

  return token.start
    ? 1.37
    : token.wordStart
      ? 1.13
      : 1;
}

/**
 * Compares two strings.
 *
 * @param {string} [a = '']
 * @param {string} [b = '']
 *
 * @returns {number}
 */
function compareStrings(a = '', b = '') {
  return a.localeCompare(b);
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

  const regexpString = words.map(escapeRegexp).flatMap(str => [ '(?<wordStart>\\b' + str + ')', str ]).join('|');

  const regexp = new RegExp(regexpString, 'ig');

  let match;
  let lastIndex = 0;

  while ((match = regexp.exec(string))) {

    const [ value ] = match;

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
      wordStart: !!match.groups.wordStart,
      start: match.index === 0
    });

    matchedWords[value.toLowerCase()] = true;

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