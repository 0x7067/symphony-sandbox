export function isFlagEnabled(flags: Record<string, boolean>, name: string): boolean {
	return flags[name] ?? true;
}
