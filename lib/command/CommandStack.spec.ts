import Diagram from '../../lib/Diagram';

import CommandModule from '../../lib/command';
import CommandStack from '../../lib/command/CommandStack';

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