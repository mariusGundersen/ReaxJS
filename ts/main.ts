import createReaxComponent, { EventMappings, ObservablesFactory, Component } from './createReaxComponent';

export default function reax<P>()
  : <M extends EventMappings, V extends Record<string, any>, P>(
    eventMappings: M,
    observablesFactory: ObservablesFactory<P, M, V>,
    Component: Component<P, M, V>)
    => React.ComponentClass<P>;

export default function reax<M extends EventMappings, V extends Record<string, any>, P>(
  eventMappings: M,
  observablesFactory: ObservablesFactory<P, M, V>)
  : (Component: Component<P, M, V>) => React.ComponentClass<P>;

export default function reax<M extends EventMappings, V extends Record<string, any>, P>(
  eventMappings: M,
  observablesFactory: ObservablesFactory<P, M, V>,
  Component: Component<P, M, V>)
  : React.ComponentClass<P>;

export default function reax<M extends EventMappings, V extends Record<string, any>, P>(
  eventMappings?: M,
  observablesFactory?: ObservablesFactory<P, M, V>,
  Component?: Component<P, M, V>) {
  if (eventMappings === undefined || observablesFactory === undefined) {
    return <M extends EventMappings, V extends Record<string, any>>(
      eventMappings: M,
      observablesFactory: ObservablesFactory<P, M, V>,
      Component: Component<P, M, V>) => reax(eventMappings, observablesFactory, Component);
  }
  if (Component === undefined) {
    return (Component: Component<P, M, V>) => reax(eventMappings, observablesFactory, Component);
  }

  if (!eventMappings || typeof eventMappings !== 'object') throw new Error('`eventMappings` must be an object');
  if (!observablesFactory || typeof observablesFactory !== 'function') throw new Error('`observablesFactory` must be a function');

  return createReaxComponent(eventMappings, observablesFactory, Component);
}