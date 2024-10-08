/**
 * @typedef { {
 *   index: number;
 *   match: boolean;
 *   value: string;
 * } } Token
 *
 * @typedef {Token[]} Tokens
 *
 * @typedef { {
 *   item: Object,
 *   tokens: Record<string, Tokens>
 * } } SearchResult
 *
 * @typedef {SearchResult[]} SearchResults
 */

/**
 * Search items by query.
 *
 * @param {Object[]} items
 * @param {string} pattern
 * @param { {
 *   keys: string[];
 * } } options
 *
 * @returns {SearchResults}
 */
export default function search(items, pattern, options) {

  const {
    keys
  } = options;

  return items.flatMap((item, idx) => {
    const tokens = getTokens(item, pattern, keys);

    if (!Object.keys(tokens).length) {
      return [];
    }

    return {
      item,
      tokens
    };
  }).sort(createResultSorter(keys));
}

/**
 * Get tokens for item.
 *
 * @param {Object} item
 * @param {string} pattern
 * @param {string[]} keys
 *
 * @returns {Record<string, Tokens>}
 */
function getTokens(item, pattern, keys) {
  return keys.reduce((results, key) => {
    const string = item[ key ];

    const tokens = getMatchingTokens(string, pattern);

    if (hasMatch(tokens)) {
      results[ key ] = tokens;
    }

    return results;
  }, {});
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

      const tokensA = resultA.tokens[key];
      const tokensB = resultB.tokens[key];

      const tokenComparison = compareTokens(tokensA, tokensB);

      if (tokenComparison !== 0) {
        return tokenComparison;
      }

      const stringComparison = compareStrings(resultA.item[ key ], resultB.item[ key ]);

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
* @param {Token} token
*
* @return {boolean}
*/
export function isMatch(token) {
  return token.match;
}

/**
* @param {Token[]} tokens
*
* @return {boolean}
*/
export function hasMatch(tokens) {
  return tokens.find(isMatch);
}

/**
* Compares two token arrays.
*
* @param {Token[]} [tokensA]
* @param {Token[]} [tokensB]
*
* @returns {number}
*/
export function compareTokens(tokensA, tokensB) {

  const tokensAHasMatch = tokensA && hasMatch(tokensA),
        tokensBHasMatch = tokensB && hasMatch(tokensB);

  if (tokensAHasMatch && !tokensBHasMatch) {
    return -1;
  }

  if (!tokensAHasMatch && tokensBHasMatch) {
    return 1;
  }

  if (!tokensAHasMatch && !tokensBHasMatch) {
    return 0;
  }

  const tokensAFirstMatch = tokensA.find(isMatch),
        tokensBFirstMatch = tokensB.find(isMatch);

  if (tokensAFirstMatch.index < tokensBFirstMatch.index) {
    return -1;
  }

  if (tokensAFirstMatch.index > tokensBFirstMatch.index) {
    return 1;
  }

  return 0;
}

/**
* Compares two strings.
*
* @param {string} [a = '']
* @param {string} [b = '']
*
* @returns {number}
*/
export function compareStrings(a = '', b = '') {
  return a.localeCompare(b);
}

/**
* @param {string} string
* @param {string} pattern
*
* @return {Token[]}
*/
export function getMatchingTokens(string, pattern) {
  var tokens = [],
      originalString = string;

  if (!string) {
    return tokens;
  }

  string = string.toLowerCase();
  pattern = pattern.toLowerCase();

  var index = string.indexOf(pattern);

  if (index > -1) {
    if (index !== 0) {
      tokens.push({
        value: originalString.slice(0, index),
        index: 0
      });
    }

    tokens.push({
      value: originalString.slice(index, index + pattern.length),
      index: index,
      match: true
    });

    if (pattern.length + index < string.length) {
      tokens.push({
        value: originalString.slice(index + pattern.length),
        index: index + pattern.length
      });
    }
  } else {
    tokens.push({
      value: originalString,
      index: 0
    });
  }

  return tokens;
}