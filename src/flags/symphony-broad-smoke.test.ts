import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	clearFlagCacheForTests,
	evaluateFlag,
	parseFlagList,
} from './symphony-broad-smoke.ts';

describe('symphony broad smoke flags', () => {
	it('parses compact flag input', () => {
		assert.deepEqual(parseFlagList('checkout:on:50,billing:off:0'), [
			{ key: 'checkout', enabled: true, rollout: 50 },
			{ key: 'billing', enabled: false, rollout: 0 },
		]);
	});

	it('uses cached values between calls', () => {
		clearFlagCacheForTests();
		const flags = [{ key: 'checkout', rollout: 10 }];

		assert.equal(evaluateFlag(flags, 'checkout', { userId: '15' }), false);
		assert.equal(evaluateFlag(flags, 'checkout', { userId: '05' }), false);
	});
});
