import CommandHandler from '../../lib/command/CommandHandler';

import Canvas from '../../lib/core/Canvas';

export class AddShapeHandler implements CommandHandler {
  private _canvas: Canvas;

  static $inject = [ 'canvas', 'rules' ];

  constructor(canvas: Canvas) {
    this._canvas = canvas;
  }

  execute(context: any) {
    const {
      parent,
      shape
    } = context;

    this._canvas.addShape(shape, parent);

    return [
      parent,
      shape
    ];
  }

  revert(context: any) {
    const {
      parent,
      shape
    } = context;

    this._canvas.removeShape(shape);

    return [
      parent,
      shape
    ];
  }

  canExecute(context: any): boolean {
    return true;
  }

  preExecute(context: any): void {}

  postExecute(context: any): void {}
}