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
  return items.reduce((results, item) => {
    const tokens = getTokens(item, pattern, options.keys);

    if (Object.keys(tokens).length) {
      const result = {
        item,
        tokens
      };

      const index = getIndex(result, results, options.keys);

      results.splice(index, 0, result);
    }

    return results;
  }, []);
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
 * @param {SearchResult} result
 * @param {SearchResults} results
 * @param {string[]} keys
 *
 * @returns {number}
 */
function getIndex(result, results, keys) {
  if (!results.length) {
    return 0;
  }

  let index = 0;

  do {
    for (const key of keys) {
      const tokens = result.tokens[ key ],
            tokensOther = results[ index ].tokens[ key ];

      if (tokens && !tokensOther) {
        return index;
      } else if (!tokens && tokensOther) {
        index++;

        break;
      } else if (!tokens && !tokensOther) {
        continue;
      }

      const tokenComparison = compareTokens(tokens, tokensOther);

      if (tokenComparison === -1) {
        return index;
      } else if (tokenComparison === 1) {
        index++;

        break;
      } else {
        const stringComparison = compareStrings(result.item[ key ], results[ index ].item[ key ]);

        if (stringComparison === -1) {
          return index;
        } else if (stringComparison === 1) {
          index++;

          break;
        } else {
          continue;
        }
      }
    }
  } while (index < results.length);

  return index;
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
* @param {Token[]} tokensA
* @param {Token[]} tokensB
*
* @returns {number}
*/
export function compareTokens(tokensA, tokensB) {
  const tokensAHasMatch = hasMatch(tokensA),
        tokensBHasMatch = hasMatch(tokensB);

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
* @param {string} a
* @param {string} b
*
* @returns {number}
*/
export function compareStrings(a, b) {
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