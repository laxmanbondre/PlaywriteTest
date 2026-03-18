// cucumber.js — Cucumber configuration file
// This file tells Cucumber where to find features, step definitions, and hooks.
// It also sets up the HTML reporter for test results.

module.exports = {
  default: {
    // Path to all .feature files (BDD test scenarios)
    paths: ["features/**/*.feature"],

    // Where to load step definitions and hooks from
    require: [
      "src/hooks/hooks.js",           // Browser lifecycle (open/close)
      "features/step-definitions/**/*.js" // All step implementation files
    ],

    // Output format: progress in terminal + JSON file for HTML report
    format: [
      "progress-bar",
      "json:reports/cucumber-report.json"
    ],

    // How many scenarios to run in parallel (1 = sequential, safe for beginners)
    parallel: 1,

    // Stop after first failure (set to false to run all tests even if some fail)
    failFast: false
  }
};
