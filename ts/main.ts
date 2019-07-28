import createReaxComponent, { EventMappings, ObservablesFactory, Component } from './createReaxComponent';
import { EventMapping } from './deconstructEventMappings';

export function constant<E>(): EventMapping<E, boolean>
export function constant<E, V>(value: V): EventMapping<E, V>
export function constant<E>(value: any = true) {
  return (_event: E) => value;
}

export default function reax<P>()
  : <P, M extends EventMappings, V extends Record<string, any>>(
    eventMappings: M,
    observablesFactory: ObservablesFactory<P, M, V>,
    component: Component<P, M, V>)
    => React.ComponentClass<P>;

export default function reax<P, M extends EventMappings, V extends Record<string, any>>(
  eventMappings: M,
  observablesFactory: ObservablesFactory<P, M, V>)
  : (component: Component<P, M, V>) => React.ComponentClass<P>;

export default function reax<P, M extends EventMappings, V extends Record<string, any>>(
  eventMappings: M,
  observablesFactory: ObservablesFactory<P, M, V>,
  component: Component<P, M, V>)
  : React.ComponentClass<P>;

export default function reax<P, M extends EventMappings, V extends Record<string, any>>(
  eventMappings?: M,
  observablesFactory?: ObservablesFactory<P, M, V>,
  component?: Component<P, M, V>) {
  if (eventMappings === undefined || observablesFactory === undefined) {
    return <M extends EventMappings, V extends Record<string, any>>(
      eventMappings: M,
      observablesFactory: ObservablesFactory<P, M, V>,
      Component: Component<P, M, V>) => reax(eventMappings, observablesFactory, Component);
  }
  if (component === undefined) {
    return (Component: Component<P, M, V>) => reax(eventMappings, observablesFactory, Component);
  }

  if (!eventMappings || typeof eventMappings !== 'object') throw new Error('`eventMappings` must be an object');
  if (!observablesFactory || typeof observablesFactory !== 'function') throw new Error('`observablesFactory` must be a function');

  return createReaxComponent(eventMappings, observablesFactory, component);
}