export class InvalidTransitionError extends Error {
  constructor(state: string, event: string) {
    super(`No transition defined for event "${event}" in state "${state}"`);
    this.name = "InvalidTransitionError";
  }
}

export class FiniteStateMachine<State extends string, Event extends string> {
  protected current: State;
  private transitions: Record<State, Partial<Record<Event, State>>>;

  constructor(initial: State, transitions: Record<State, Partial<Record<Event, State>>>) {
    this.current = initial;
    this.transitions = transitions;
  }

  get state(): State {
    return this.current;
  }

  transition(event: Event): void {
    const next = this.transitions[this.current]?.[event];
    if (next === undefined) {
      throw new InvalidTransitionError(this.current, event);
    }
    this.current = next;
  }

  canTransition(event: Event): boolean {
    return this.transitions[this.current]?.[event] !== undefined;
  }
}
