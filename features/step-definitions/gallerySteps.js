// features/step-definitions/gallerySteps.js
// ─────────────────────────────────────────────────────────────────────────────
// STEP DEFINITIONS — Gallery Page
//
// Step definitions are the GLUE between Gherkin feature files and
// the actual Playwright code that drives the browser.
//
// Each step definition:
//   1. Matches a pattern from the feature file (exact text or regex)
//   2. Runs JavaScript/Playwright code to perform the action or assertion
//   3. Can pass data between steps via "this" (the Cucumber World object)
//
// HOW MATCHING WORKS:
//   Feature line:   When I click on the device named "iPhone 17"
//   Step def:       When('I click on the device named {string}', ...)
//   {string} captures the text inside quotes → "iPhone 17"
//   {int}    captures a number              → 5
// ─────────────────────────────────────────────────────────────────────────────

const { Given, When, Then } = require("@cucumber/cucumber");
const DeviceGalleryPage = require("../../src/pages/DeviceGalleryPage");
const DevicePDPPage = require("../../src/pages/DevicePDPPage");

// ── GIVEN steps — set up the initial state ────────────────────────────────

Given("I am on the Spark NZ device gallery page", async function () {
  // "this.page" is set in hooks.js Before hook
  // We create a new instance of the page object and navigate to the gallery
  this.galleryPage = new DeviceGalleryPage(this.page);
  this.pdpPage = new DevicePDPPage(this.page);

  await this.galleryPage.open();
  console.log("  ✓ On the Device Gallery page");
});

// ── WHEN steps — user actions ─────────────────────────────────────────────

When("I click on the first device in the gallery", async function () {
  // Clicks the very first device card on the page
  await this.galleryPage.clickFirstDevice();

  // Wait for PDP to load after navigation
  await this.pdpPage.waitForPDPToLoad();
});

When("I click on the device named {string}", async function (deviceName) {
  // {string} captures the text in quotes from the feature file
  // e.g., "I click on the device named "iPhone 17"" → deviceName = "iPhone 17"
  await this.galleryPage.clickDeviceByName(deviceName);

  // Store the selected device name for use in later steps
  this.selectedDevice = deviceName;

  // Wait for PDP to load
  await this.pdpPage.waitForPDPToLoad();
});

When("I navigate back to the gallery", async function () {
  // Use the browser's back button
  await this.page.goBack();
  await this.galleryPage.waitForGalleryToLoad();
});

// ── THEN steps — verifications / assertions ───────────────────────────────

Then("I should see at least {int} device listed on the gallery page", async function (minCount) {
  // {int} captures a number — e.g., "at least 5" → minCount = 5
  await this.galleryPage.verifyMinimumDevicesShown(minCount);
});

Then("I should see at least {int} devices listed on the gallery page", async function (minCount) {
  // Same as above but handles plural "devices" phrasing
  await this.galleryPage.verifyMinimumDevicesShown(minCount);
});

Then("I should be on the device product detail page", async function () {
  // Verifies that we navigated to a PDP (by checking URL pattern)
  const url = this.page.url();
  const isPDP = url.includes("/products/") || url.includes("offerId");

  console.log(`  ✓ Current URL: ${url}`);

  if (!isPDP) {
    throw new Error(
      `❌ Expected to be on a product detail page, but URL is: ${url}`
    );
  }

  console.log("  ✓ Confirmed on Product Detail Page");
});

// Also register as a "Given" since it's used in PDP feature Background
Given("I click on the first device in the gallery", async function () {
  await this.galleryPage.clickFirstDevice();
  await this.pdpPage.waitForPDPToLoad();
});

Given("I should be on the device product detail page", async function () {
  const url = this.page.url();
  const isPDP = url.includes("/products/") || url.includes("offerId");

  if (!isPDP) {
    throw new Error(`❌ Expected PDP but URL is: ${url}`);
  }

  console.log("  ✓ On Product Detail Page");
});
