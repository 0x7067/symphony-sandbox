export class InvalidTransitionError extends Error {
  constructor(state: string, event: string) {
    super(`No transition defined for event "${event}" in state "${state}"`);
    this.name = "InvalidTransitionError";
  }
}

export class FiniteStateMachine<State extends string, Event extends string> {
  private _current: State;
  private _transitions: Record<State, Record<Event, State>>;

  constructor(initial: State, transitions: Record<State, Record<Event, State>>) {
    this._current = initial;
    this._transitions = transitions;
  }

  get state(): State {
    return this._current;
  }

  transition(event: Event): void {
    const next = this._transitions[this._current]?.[event];
    if (next === undefined) {
      throw new InvalidTransitionError(this._current, event);
    }
    this._current = next;
  }

  canTransition(event: Event): boolean {
    return this._transitions[this._current]?.[event] !== undefined;
  }
}
