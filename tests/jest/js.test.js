

const { add } = require('./add.js');

test('adds 1 + 2 is equal to 3', () => {
    expect(add(1,2)).toBe(3);
});