module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test.js'],
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: [],
    verbose: true,
    testTimeout: 10000
}; 