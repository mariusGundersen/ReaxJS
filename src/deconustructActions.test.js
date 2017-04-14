import test from 'ava';
import * as Rx from 'rxjs/Rx';

import deconstructActions from '../lib/deconstructActions.js';

test('not a function should throw', t => {
  t.throws(() => deconstructActions({
    'test': null
  }));
});
