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
  sources: ObservableEvents<Mappings>,
  props: Observable<Props>,
  initalProps: Props
) => Observables<Values>;

type ComponentProps<Map, Props, Values> = {
  events: Events<Map>;
  props: Props;
  values: Values;
};

export type Component<Props, Map, Values> = React.StatelessComponent<ComponentProps<Map, Props, Values>>;

export { EventMappings, Events, ObservableEvents };

export default function createReaxComponent<Mappings extends EventMappings, Values extends Record<string, any>, Props>(
  eventMappings: Mappings,
  observablesFactory: ObservablesFactory<Props, Mappings, Values>,
  Component: Component<Props, Mappings, Values>) {
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

    componentWillReceiveProps(nextProps: Props) {
      this.propsSubject.next(nextProps);
    }

    componentWillUnmount() {
      this.propsSubject.complete();
      this.completes.forEach(c => c());
    }

    render() {
      return <Component events={this.events} props={this.props} values={this.state} />;
    }
  } as React.ComponentClass<Props, Values>
}
