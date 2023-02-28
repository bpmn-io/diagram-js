import Diagram from '../Diagram';

import CommandModule from '.';
import CommandStack from './CommandStack';

import { AddShapeHandler } from './CommandHandler.spec';

const diagram = new Diagram({
  modules: [
    CommandModule
  ]
});

const commandStack = diagram.get<CommandStack>('commandStack');

commandStack.registerHandler('shape.add', AddShapeHandler);

commandStack.canExecute('shape.add', { foo: 'bar' });

commandStack.canUndo();

commandStack.canRedo();

commandStack.clear();

commandStack.execute('shape.add', { foo: 'bar' });

commandStack.redo();

commandStack.undo();