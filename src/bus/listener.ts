export type Listener<EM extends Record<string, unknown>, K extends keyof EM> = (payload: EM[K]) => void;
