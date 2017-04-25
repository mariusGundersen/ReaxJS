import test from 'ava';
import * as Rx from 'rxjs/Rx';

import deconstructEventMappings from '../lib/deconstructEventMappings.js';

test('not a function should throw', t => {
  t.throws(() => deconstructEventMappings({
    'test': null
  }));
});
