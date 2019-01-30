module.exports = {
  automock: false,
  collectCoverage: true,
  coverageReporters: ['lcov'],
  testRegex: '.*\\.test\\.js$',
  globals: {
    NODE_ENV: "test"
  },
  testEnvironment: 'node'
};
