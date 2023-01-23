import { Base } from '../model';

export default interface CommandHandler {
  execute?(context: any): Base[];
  revert?(context: any): Base[];
  canExecute?(context: any): boolean;
  preExecute?(context: any): void;
  postExecute?(context: any): void;
  $inject?: string[];
}