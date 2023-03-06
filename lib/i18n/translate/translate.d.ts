export type Replacements = {
  [key: string]: string;
};

export type TranslateFunction = (template: string, replacements?: Replacements) => string;