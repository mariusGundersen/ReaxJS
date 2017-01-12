import Rx from 'rxjs/Rx';

export default function deconstruct(actions){
  const functions = Object.create(null);
  const sources = Object.create(null);
  for(let key of Object.keys(actions)){
    if(typeof actions[key] !== 'function') throw new Error(`action ${key} must be a function`);

    sources[key] = new Rx.Observable(s => {
      functions[key] = v => s.next(actions[key](v))
    });
  }

  return {
    functions,
    sources
  };
}