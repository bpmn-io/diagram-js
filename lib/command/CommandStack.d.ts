import { Injector } from 'didi';

import CommandHandler from './CommandHandler';

import EventBus from '../core/EventBus';

import { Base } from '../model';

export type CommandContext = any;

export type Action = {
  command: string;
  context: any;
};

export type CommandHandlerConstructor = {
  new (...args: any[]) : CommandHandler
}

export type CommandHandlerInstance = Object;

export type HandlerMap = {
  [key: string]: CommandHandler;
};

export default class CommandStack {
  constructor(eventBus: EventBus, injector: Injector);
  execute(command: string, context: CommandContext): void;
  canExecute(command: string, context: CommandContext): boolean;
  clear(emit?: boolean): void;
  undo(): void;
  redo(): void;
  register(command: string, handler: CommandHandler): void;
  registerHandler(command: string, handlerCls: CommandHandlerConstructor);
  canUndo(): boolean;
  canRedo(): boolean;
}