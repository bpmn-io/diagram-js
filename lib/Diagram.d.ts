import {
  InjectionContext,
  Injector,
  LocalsMap,
  ModuleDeclaration
} from 'didi';

export type DiagramOptions = {
  modules: ModuleDeclaration[]
}

export default class Diagram {
  constructor(options: DiagramOptions, injector?: Injector);
  get<T>(name: string, strict?: boolean): T;
  invoke<T>(func: (...args: any[]) => T, context?: InjectionContext, locals?: LocalsMap): T;
  destroy(): void;
  clear(): void;
}