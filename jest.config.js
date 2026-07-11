/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
  // transformIgnorePatterns: ["node_modules/(?!.*(mock-jwks|msw|rettime))"],
};
