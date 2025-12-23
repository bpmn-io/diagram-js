import { use } from 'chai';
import sinonChai from 'sinon-chai';

import BoundsMatchers from './matchers/BoundsMatchers';
import ConnectionMatchers from './matchers/ConnectionMatchers';

// setup chai with sinon-chai plugin
use(sinonChai);

// add suite specific matchers
use(BoundsMatchers);
use(ConnectionMatchers);