export class FiniteStateMachine<State extends string, Event extends string> {
  protected current: State;

  constructor(initial: State, _transitions: Record<State, Record<Event, State>>) {
    this.current = initial;
    // BUG: transitions table is ignored.
  }

  transition(_event: Event): void {
    // BUG: doesn't consult transitions; mutates arbitrarily.
  }
}
