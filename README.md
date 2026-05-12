# symphony-sandbox

Tiny sandbox repo used to smoke-test the Symphony pipeline end-to-end.

`src/math.ts` exports `add` and `max`. `max` has a subtle bug — it returns
the smaller value. The pipeline should:

1. Read the open issue describing the bug.
2. Write a failing test for `max`.
3. Fix the implementation.
4. Simplify and review.
5. Open a draft PR.

Run tests locally: `node --test --experimental-strip-types src/`.
