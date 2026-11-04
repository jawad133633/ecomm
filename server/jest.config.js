module.exports = {
  testEnvironment: "node",

  testMatch: [
    "**/tests/**/*.test.js"
  ],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  testTimeout: 30000,

  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "services/**/*.js",
    "!**/node_modules/**"
  ],

  coverageDirectory: "coverage",

  coverageReporters: [
    "text",
    "html",
    "lcov"
  ]
};