import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export type Dict = {
  [k : string] : any
}

export type ActionMappings<E extends Dict, I extends Dict> = {
  [T in keyof E] : (event : E[T]) => any
} & {
  [T in keyof I] : (event : any) => I[T]
}

export type Actions<E extends Dict> = {
  [T in keyof E] : (event : E[T]) => void
}

export type ObservableActions<I extends Dict> = {
  [T in keyof I] : Observable<I[T]>
}

export type Complete = () => void;

export default function deconstruct<E extends Dict, I extends Dict>(actionMappings : ActionMappings<E, I>){
  const actions = Object.create(null) as Actions<I>;
  const observableActions = Object.create(null) as ObservableActions<E>;
  const completes = [] as Complete[];
  for(let key of Object.keys(actionMappings)){
    if(typeof actionMappings[key] !== 'function') throw new Error(`action ${key} must be a function`);

    const subject = new Subject<any>();
    actions[key] = v => subject.next(actionMappings[key](v));
    completes.push(() => subject.complete());
    observableActions[key] = subject;
  }

  return {
    actions,
    observableActions,
    completes
  };
}