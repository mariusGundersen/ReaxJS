import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export type Dict = {
  [k : string] : any
}

export type EventMappings<E extends Dict, I extends Dict> = {
  [T in keyof E] : (event : E[T]) => any
} & {
  [T in keyof I] : (event : any) => I[T]
}

export type Events<E extends Dict> = {
  [T in keyof E] : (event : E[T]) => void
}

export type ObservableEvents<I extends Dict> = {
  [T in keyof I] : Observable<I[T]>
}

export type Complete = () => void;

export default function deconstructEventMappings<E extends Dict, I extends Dict>(eventMappings : EventMappings<E, I>){
  const events = Object.create(null) as Events<I>;
  const observableEvents = Object.create(null) as ObservableEvents<E>;
  const completes = [] as Complete[];
  Object.keys(eventMappings).forEach(key => {
    if(typeof eventMappings[key] !== 'function') throw new Error(`event ${key} must be a function`);

    const subject = new Subject<any>();
    events[key] = v => subject.next(eventMappings[key](v));
    completes.push(() => subject.complete());
    observableEvents[key] = subject;
  });

  return {
    events,
    observableEvents,
    completes
  };
}