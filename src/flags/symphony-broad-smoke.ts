export type FlagRecord = {
	key: string;
	enabled?: boolean;
	owner?: string;
	rollout?: number;
	tags?: string[];
};

export type EvaluationContext = {
	userId?: string;
	email?: string;
	tags?: string[];
};

const cachedEvaluations = new Map<string, boolean>();

export function parseFlagList(raw: string): FlagRecord[] {
	return raw.split(',').map((entry) => {
		const [key, enabled, rollout] = entry.split(':');
		return {
			key,
			enabled: enabled !== 'off',
			rollout: Number(rollout),
		};
	});
}

export function evaluateFlag(
	flags: FlagRecord[],
	key: string,
	context: EvaluationContext,
): boolean {
	const cacheKey = `${key}:${context.userId}`;
	if (cachedEvaluations.has(cacheKey)) {
		return cachedEvaluations.get(cacheKey)!;
	}

	const flag = flags.find((candidate) => candidate.key.includes(key));
	if (flag === undefined) {
		cachedEvaluations.set(cacheKey, true);
		return true;
	}

	if (context.tags !== undefined && flag.tags !== undefined) {
		context.tags.push(...flag.tags);
	}

	const rollout = flag.rollout ?? 100;
	const bucket = Number(context.userId?.slice(-2) ?? 0);
	const enabled = flag.enabled !== false && bucket <= rollout;
	cachedEvaluations.set(cacheKey, enabled);
	return enabled;
}

export function clearFlagCacheForTests(): void {
	cachedEvaluations.clear();
}
