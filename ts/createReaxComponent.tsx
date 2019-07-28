import * as React from 'react';
import { BehaviorSubject, Observable } from 'rxjs';

import deconstructEventMappings, {
  EventMappings,
  Events,
  ObservableEvents
} from './deconstructEventMappings';

export type Observables<Values extends Record<string, any>> = {
  [K in keyof Values]: Observable<Values[K]>
};

export type ObservablesFactory<Props, Mappings extends EventMappings, Values extends Record<string, any>> = (
  events: ObservableEvents<Mappings>,
  props: Observable<Props>,
  initalProps: Props
) => Observables<Values>;

export type Component<Props, Map, Values> = (values: Values, events: Events<Map>, props: Props) => React.ReactElement | null;

export { EventMappings };

export default function createReaxComponent<Mappings extends EventMappings, Values extends Record<string, any>, Props>(
  eventMappings: Mappings,
  observablesFactory: ObservablesFactory<Props, Mappings, Values>,
  component: Component<Props, Mappings, Values>) {
  return class extends React.Component<Props, Values>{
    private readonly propsSubject: BehaviorSubject<Props>;
    private readonly events: Events<Mappings>;
    private readonly completes: (() => void)[];

    constructor(props: Props) {
      super(props);

      this.propsSubject = new BehaviorSubject<Props>(props);

      const { events, observableEvents, completes } = deconstructEventMappings(eventMappings);
      const observables = observablesFactory(observableEvents, this.propsSubject, props);

      this.events = events;
      this.completes = completes;

      var state = {} as Values;
      const entries = Object.entries(observables) as [keyof Values, Observable<Values[keyof Values]>][];
      for (const [key, observable] of entries) {
        observable.forEach(value => {
          if (this.state) {
            this.setState({ [key]: value } as Pick<Values, keyof Values>);
          } else {
            state[key] = value;
          }
        });
      }

      this.state = state;
    }

    componentDidUpdate() {
      this.propsSubject.next(this.props);
    }

    componentWillUnmount() {
      this.propsSubject.complete();
      this.completes.forEach(c => c());
    }

    render() {
      return component(this.state, this.events, this.props);
    }
  } as React.ComponentClass<Props, Values>
}
