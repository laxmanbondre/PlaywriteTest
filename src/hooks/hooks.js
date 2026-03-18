// src/hooks/hooks.js
// ─────────────────────────────────────────────────────────────────────────────
// HOOKS are special Cucumber functions that run BEFORE or AFTER each scenario.
// They are the right place to:
//   - Launch the browser (Before)
//   - Open a new page/tab (Before)
//   - Take a screenshot on failure (After)
//   - Close the browser (After)
//
// Think of hooks as the "setup and teardown" of each test.
// ─────────────────────────────────────────────────────────────────────────────

const { Before, After, BeforeAll, AfterAll, Status } = require("@cucumber/cucumber");
const { chromium, firefox, webkit } = require("playwright");
require("dotenv").config();

// Store the browser instance globally so all steps can access it
// We use a module-level variable shared via the "World" object (explained below)
let browser;

// ── BeforeAll ─────────────────────────────────────────────────────────────────
// Runs ONCE before the entire test suite starts.
// We launch the browser here so it only starts up once (faster).
BeforeAll(async function () {
  const browserName = process.env.BROWSER || "chromium";
  const headless = process.env.HEADLESS !== "false"; // default: true
  const slowMo = parseInt(process.env.SLOW_MO || "0");

  // Choose browser based on environment variable
  const browserEngines = { chromium, firefox, webkit };
  const engine = browserEngines[browserName] || chromium;

  console.log(`\n🚀 Launching ${browserName} (headless: ${headless})\n`);

  browser = await engine.launch({
    headless,
    slowMo,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
});

// ── Before ────────────────────────────────────────────────────────────────────
// Runs before EACH individual scenario.
// We open a fresh browser context and page for every scenario.
// This ensures tests don't share cookies/state with each other (test isolation).
//
// "this" here refers to the Cucumber World object — a shared context object
// that exists for the duration of one scenario. We attach our page to it so
// step definitions can access it via "this.page".
Before(async function () {
  // A browser context is like an incognito window — isolated from others
  this.context = await browser.newContext({
    // Simulate a realistic viewport size
    viewport: { width: 1440, height: 900 },

    // Set a realistic user agent so the site doesn't block us
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/124.0.0.0 Safari/537.36",

    // Ignore HTTPS errors (useful for staging/test environments)
    ignoreHTTPSErrors: true
  });

  // Open a new tab (page) within the context
  this.page = await this.context.newPage();

  // Set how long Playwright waits for elements before throwing an error
  this.page.setDefaultTimeout(parseInt(process.env.DEFAULT_TIMEOUT || "30000"));

  // Attach the base URL so pages can reference it
  this.baseUrl = process.env.BASE_URL || "https://www.spark.co.nz";
});

// ── After ─────────────────────────────────────────────────────────────────────
// Runs after EACH individual scenario.
// If the scenario FAILED, we take a screenshot for debugging.
// Then we always close the browser context.
After(async function (scenario) {
  // scenario.result.status tells us if the test passed or failed
  if (scenario.result.status === Status.FAILED) {
    console.log(`\n❌ Scenario FAILED: ${scenario.pickle.name}`);

    // Take a screenshot and attach it to the Cucumber report
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, "image/png");
    console.log("📸 Screenshot captured and attached to report\n");
  }

  // Close context (this also closes the page) after every scenario
  if (this.context) {
    await this.context.close();
  }
});

// ── AfterAll ──────────────────────────────────────────────────────────────────
// Runs ONCE after ALL scenarios have finished.
// We close the browser to free memory.
AfterAll(async function () {
  if (browser) {
    await browser.close();
    console.log("\n✅ Browser closed. Test run complete.\n");
  }
});
