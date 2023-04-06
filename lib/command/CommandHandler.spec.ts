import CommandHandler from './CommandHandler';

import Canvas from '../core/Canvas';

export class AddShapeHandler implements CommandHandler {
  private _canvas: Canvas;

  static $inject = [ 'canvas' ];

  constructor(canvas: Canvas) {
    this._canvas = canvas;
  }

  execute(context) {
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

  revert(context) {
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

  canExecute(_) {
    return true;
  }

  preExecute(_) {}

  postExecute(_) {}
}