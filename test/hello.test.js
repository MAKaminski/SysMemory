const assert = require('assert');
const { helloWorld } = require('../app/hello');

suite('Hello World Function', () => {
    test('returns hello world', () => {
        assert.strictEqual(helloWorld(), 'hello world');
    });
});
