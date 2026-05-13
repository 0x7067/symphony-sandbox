# symphony-sandbox

Pipeline smoke target. `src/math.ts` exports `add` and `max`; `max` has a known bug (returns the smaller). The pipeline should write a failing test, fix it, simplify, review, and open a draft PR. Run tests with `pnpm test:unit`.
