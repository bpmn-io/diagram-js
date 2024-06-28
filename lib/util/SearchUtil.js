/**
 * @typedef { {
 *   normal?: string;
 *   matched?: string;
 * } } Token
 */

/**
 * @param {Token} token
 *
 * @return {boolean}
 */
export function isMatch(token) {
  return 'matched' in token;
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
 * @param {string} text
 * @param {string} pattern
 *
 * @return {Token[]}
 */
export function findMatches(text, pattern) {
  var tokens = [],
      originalText = text;

  if (!text) {
    return tokens;
  }

  text = text.toLowerCase();
  pattern = pattern.toLowerCase();

  var index = text.indexOf(pattern);

  if (index > -1) {
    if (index !== 0) {
      tokens.push({
        normal: originalText.slice(0, index),
        index: 0
      });
    }

    tokens.push({
      matched: originalText.slice(index, index + pattern.length),
      index: index
    });

    if (pattern.length + index < text.length) {
      tokens.push({
        normal: originalText.slice(index + pattern.length),
        index: index + pattern.length
      });
    }
  } else {
    tokens.push({
      normal: originalText,
      index: 0
    });
  }

  return tokens;
}