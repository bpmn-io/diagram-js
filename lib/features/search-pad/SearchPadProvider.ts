import { Element } from '../../model/Types';

export type Token = {
  matched: string;
  normal: string;
};

export type SearchResult = {
  primaryTokens: Token[];
  secondaryTokens: Token[];
  element: Element;
};

export default interface SearchPadProvider {
  find(pattern: string): SearchResult[];
}