import { Observable, Subject } from 'rxjs';

export type Dict = Record<string, any>;

export type EventMapping<E, I> = (event: E) => I;
export type Event<E> = (event: E) => void;

export type EventMappings3 = Record<string, EventMapping<any, any>>;

export type EventMappings<E extends Dict, I extends Dict> = {
  [T in keyof E] : (event : E[T]) => any
} & {
  [T in keyof I] : (event : any) => I[T]
}

export type EventMappings2<E extends Record<string, (e: any) => any>> = {
  [T in keyof E] : E[T] extends (event : infer Event) => infer Input ? (event : Event) => Input : never
}

export type Events<E extends Dict> = {
  [T in keyof E] : (event : E[T]) => void
}
export type Events2  = Record<string, Event<any>>;

export type ObservableEvents<I extends Dict> = {
  [T in keyof I] : Observable<I[T]>
}
export type ObservableEvents2 = Record<string, Observable<any>>;

export type Complete = () => void;

export default function deconstructEventMappings<E extends Dict, I extends Dict>(eventMappings : EventMappings<E, I>){
  const events = Object.create(null) as Events<E>;
  const observableEvents = Object.create(null) as ObservableEvents<I>;
  const completes = [] as Complete[];
  const keys = Object.keys(eventMappings) as (keyof E & keyof I)[];
  keys.forEach(key => {
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