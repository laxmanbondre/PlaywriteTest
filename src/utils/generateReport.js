// src/utils/generateReport.js
// ─────────────────────────────────────────────────────────────────────────────
// REPORT GENERATOR
//
// After running tests (which produce reports/cucumber-report.json),
// run this script to generate a beautiful HTML report:
//   node src/utils/generateReport.js
//
// The HTML report will open in your browser and show:
//   - Pass/fail summary
//   - Screenshots of failures
//   - Step-by-step execution log
//   - Duration of each scenario
// ─────────────────────────────────────────────────────────────────────────────

const report = require("multiple-cucumber-html-reporter");
const path = require("path");
const fs = require("fs");

// Ensure the reports directory exists
const reportsDir = path.join(__dirname, "../../reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

report.generate({
  // Where to find the Cucumber JSON output
  jsonDir: path.join(__dirname, "../../reports"),

  // Where to write the HTML report
  reportPath: path.join(__dirname, "../../reports/html-report"),

  // Report metadata shown in the header
  metadata: {
    browser: {
      name: process.env.BROWSER || "chrome",
      version: "latest"
    },
    device: "Local Test Machine",
    platform: {
      name: process.platform,
      version: process.version
    }
  },

  // Custom report options
  customData: {
    title: "Spark NZ E2E Test Results",
    data: [
      { label: "Project", value: "Spark NZ Playwright BDD" },
      { label: "Release", value: "1.0.0" },
      { label: "Environment", value: process.env.BASE_URL || "Production" },
      { label: "Executed", value: new Date().toLocaleString() }
    ]
  },

  // Open the report automatically after generation
  openReportInBrowser: true,

  // Display failed scenarios first
  displayDuration: true,
  durationInMS: true
});

console.log("\n📊 HTML report generated at: reports/html-report/index.html\n");
