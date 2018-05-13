import test from 'ava';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import deconstructEventMappings from '../lib/deconstructEventMappings.js';

test('not a function should throw', t => {
  t.throws(() => deconstructEventMappings({
    'test': null
  }));
});
