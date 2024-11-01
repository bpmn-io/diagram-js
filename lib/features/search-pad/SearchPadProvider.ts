import type { Element } from '../../model/Types';

type LegacyToken = {
  matched?: string;
  normal?: string;
};

type ModernToken = {
  match: boolean;
  value: string;
};

export type Token = LegacyToken | ModernToken;

export type SearchResult = {
  primaryTokens: Token[];
  secondaryTokens: Token[];
  element: Element;
};

export default interface SearchPadProvider {
  find(pattern: string): SearchResult[];
}
