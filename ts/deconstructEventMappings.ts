import { Observable, Subject } from 'rxjs';

export type Event<Event> = (event: Event) => void;

export type EventMapping<Event, Value> = (event: Event) => Value;

export type EventMappings = Record<string, EventMapping<any, any>>;

export type Events<Mappings> = {
  [K in keyof Mappings]: Event<Mappings[K] extends EventMapping<infer Event, any> ? Event : never>
};

export type ObservableEvents<Mappings> = {
  [K in keyof Mappings]: Observable<Mappings[K] extends EventMapping<any, infer Value> ? Value : never>
};

export type Complete = () => void;

export default function deconstructEventMappings<Mappings extends EventMappings>(eventMappings: Mappings) {
  const events = Object.create(null) as Events<Mappings>;
  const observableEvents = Object.create(null) as ObservableEvents<Mappings>;
  const completes = [] as Complete[];
  const keys = Object.keys(eventMappings) as (keyof Mappings)[];
  keys.forEach(key => {
    if (typeof eventMappings[key] !== 'function') throw new Error(`event ${key} must be a function`);

    const subject = new Subject<any>();
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