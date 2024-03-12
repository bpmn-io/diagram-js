import Diagram from '../../Diagram.js';

import RulesModule from './index.js';
import Rules from './Rules.js';

const diagram = new Diagram({
  modules: [
    RulesModule
  ]
});

const rules = diagram.get<Rules>('rules');

rules.allowed('foo');

rules.allowed('foo', { bar: 'baz' });