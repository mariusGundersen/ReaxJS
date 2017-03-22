import Rx from 'rxjs/Rx';

export default function deconstruct(actions){
  const functions = Object.create(null);
  const sources = Object.create(null);
  const completes = [];
  for(let key of Object.keys(actions)){
    if(typeof actions[key] !== 'function') throw new Error(`action ${key} must be a function`);

    const subject = new Rx.Subject();
    functions[key] = v => subject.next(actions[key](v));
    completes.push(() => subject.complete());
    sources[key] = new Rx.Observable(s => subject.subscribe(s));
  }

  return {
    functions,
    sources,
    completes
  };
}