import Diagram from '../../Diagram';

import RulesModule from '.';
import Rules from './Rules';

const diagram = new Diagram({
  modules: [
    RulesModule
  ]
});

const rules = diagram.get<Rules>('rules');

rules.allowed('foo');

rules.allowed('foo', { bar: 'baz' });