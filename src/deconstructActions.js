import Rx from 'rxjs/Rx';

export default function deconstructActions(actions){
  const functions = Object.create(null);
  const observables = Object.create(null);
  for(const key of Object.keys(actions)){
    if(typeof actions[key] !== 'function') throw new Error(`\`definition.actions['${key}']\` must be a function`);

    observables[key] = new Rx.Observable(s => functions[key] = v => s.next(v));
  }

  return {
    functions,
    observables
  };
}