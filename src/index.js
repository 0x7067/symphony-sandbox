// Entry point so `node --test --experimental-strip-types src/` can resolve
// this directory as a module. Importing the test file registers all test()
// calls with Node's built-in test runner.
import './math.test.ts';
