export default {
    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.js",
        "!**/node_modules/**"
    ],
    testEnvironment: 'jest-environment-node',
    transform: {},
}