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
 * Search items by query.
 *
 * @template [T=Record<string, string | string[]>]
 *
 * @param {T[]} items Items to be searched for
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

  const filteredResult = items.flatMap((item) => {
    const tokens = matchItem(item, words, keys);

    if (!tokens) {
      return [];
    }

    return {
      item,
      tokens
    };
  });

  const scoredResult = filteredResult.map((result) => {
    const score = getMaxScore(result);
    return { ...result, score };
  });

  return scoredResult.sort((a,b)=> b.score - a.score);
}

/**
 * Match an item and return tokens in case of a match.
 *
 * @param {Record<string, string | string[]>} item Object to be matched
 * @param {string[]} words Search pattern split up into words
 * @param {string[]} keys Keys of the item to be matched
 *
 * @returns {Record<string, Tokens>}
 */
function matchItem(item, words, keys) {

  const {
    matchedWords,
    tokens
  } = keys.reduce((result, key) => {
    let itemValue = item[ key ];

    if (!isArray(itemValue)) {
      itemValue = [ itemValue ];
    }

    return itemValue.reduce((result, itemString, i) => {
      const {
        tokens,
        matchedWords
      } = matchString(itemString, words);

      return {
        tokens: {
          ...result.tokens,
          [ key + i]: (result.tokens[ key + i] || []).concat(tokens),
        },
        matchedWords: {
          ...result.matchedWords,
          ...matchedWords
        }
      };
    }, result);
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
 * Calculates the score for each token in an item. No need to check for keys as only keyed values are tokenized.
 *
 * @param {SearchResult} item
 * @returns {number} the highest score of the tokens
 */
function getMaxScore(item) {
  let modifier = 1;
  let score = -Infinity;

  Object.values(item.tokens).forEach((token) => {
    const keyScore = modifier * scoreTokens(
      token
    );

    if (keyScore > score) {
      score = keyScore;
    }
    modifier *= 0.85;
  });
  return score;
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
          ? 6
          : 3
      )
  ) * modifier;
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
    const wordEnd = end || /\s/.test(string.charAt(endIndex + 1));

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
