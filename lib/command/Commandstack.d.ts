import { Injector } from 'didi';

import CommandHandler from './CommandHandler';

import EventBus from '../core/EventBus';

import { Base } from '../model';

export type Action = {
  command: string;
  context: any;
};

export type CommandHandlerInstance = Object;

export type HandlerMap = {
  [key: string]: CommandHandlerInstance;
};

export default class CommandStack {
  constructor(eventBus: EventBus, injector: Injector);
  execute(command: string, context: any): void;
  canExecute(command: string, context: any): boolean;
  clear(emit?: boolean): void;
  undo(): void;
  redo(): void;
  register(command: string, handler: Object): void;
  registerHandler(command: string, handlerCls: CommandHandler);
  canUndo(): boolean;
  canRedo(): boolean;
  private _getRedoAction(): Action;
  private _getUndoAction(): Action;
  private _internalUndo(action: Action): void;
  private _fire(command: string, event: any): void;
  private _fire(command: string, qualifier: string, event: any): void;
  private _createId(): number;
  private _atomicDo(fn: Function): void;
  private _internalExecute(action: Action, redo?: boolean): void;
  private _pushAction(action: Action): void;
  private _popAction(): void;
  private _markDirty(elements: Base[]): void;
  private _executedAction(action: Action, redo?: boolean): void;
  private _revertedAction(action: Action): void;
  private _getHandler(command: string): CommandHandlerInstance;
  private _setHandler(command: string, handler: CommandHandlerInstance): void;

  private _handlerMap: HandlerMap;
  private _stack: Action[];
  private _stackIdx: number;
  private _currentExecution: Object;
  private _injector: Injector;
  private _eventBus: EventBus;
  private _uid: number;
  private static $inject: string[];
}