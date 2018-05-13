import test from 'ava';
import * as Rx from 'rxjs/Rx';

import deconstructEventMappings from '../lib/deconstructEventMappings.js';

test('not a function should throw', t => {
  t.throws(() => deconstructEventMappings({
    'test': null
  }));
});



test('triggering an action once should affect both subscribers', t => {
  t.plan(2);


  const subject = new Rx.BehaviorSubject();
  const mapped = subject
    .do(x => console.log('do', x))
    .map(x => x*2);

  mapped.subscribe();
  mapped.subscribe();

  subject.next(1);


});