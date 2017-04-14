import * as Rx from 'rxjs/Rx';

export type Actions = {
  [key : string] : (value : any) => any
}

export type Functions = {
  [key : string] : (value : any) => void
}

export type Sources = {
  [key : string] : Rx.Observable<any>
}

export type Complete = () => void;

export default function deconstruct(actions : Actions){
  const functions = Object.create(null) as Functions;
  const sources = Object.create(null) as Sources;
  const completes = [] as Complete[];
  for(let key of Object.keys(actions)){
    if(typeof actions[key] !== 'function') throw new Error(`action ${key} must be a function`);

    const subject = new Rx.Subject<any>();
    functions[key] = v => subject.next(actions[key](v));
    completes.push(() => subject.complete());
    sources[key] = new Rx.Observable<any>(s => subject.subscribe(s));
  }

  return {
    functions,
    sources,
    completes
  };
}